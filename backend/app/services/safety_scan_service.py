from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.inference_pipeline import InferencePipeline
from app.models.safety_scan import SafetyScan
from app.models.user import User
from app.repositories.safety_scan_repository import SafetyScanRepository
from app.schemas.safety import SafetyFinding, SafetyScanHistoryResponse, SafetyScanResponse
from app.services.attachment_safety_service import AttachmentSafetyService
from app.services.audit_service import AuditService
from app.services.email_safety_service import EmailSafetyService
from app.services.hash_safety_service import HashSafetyService
from app.services.image_privacy_service import ImagePrivacyService
from app.observability.metrics import record_risk
from app.services.safety_language_service import build_user_advice, risk_to_verdict, verdict_label
from app.services.url_safety_service import UrlSafetyService, extract_urls
from app.services.voice_safety_service import VoiceSafetyService


class SafetyScanService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = SafetyScanRepository(db)
        self.audit = AuditService(db)
        self.pipeline = InferencePipeline()
        self.url_service = UrlSafetyService()
        self.email_service = EmailSafetyService()
        self.attachment_service = AttachmentSafetyService()
        self.hash_service = HashSafetyService()
        self.voice_service = VoiceSafetyService()
        self.image_service = ImagePrivacyService()

    def check_message(self, current_user: User, message: str, channel: str) -> SafetyScanResponse:
        ai_result = self.pipeline.analyze_message(message, channel)
        verdict = risk_to_verdict(ai_result["risk_score"])
        findings = [SafetyFinding(label="Signal", value=rule, note="This pattern contributed to the result.", severity="warning") for rule in ai_result["triggered_rules"]]
        findings.extend(
            SafetyFinding(
                label="Helpful context",
                value=chunk["source"],
                note=chunk["text"],
                severity="info",
            )
            for chunk in ai_result["retrieved_chunks"]
        )
        return self._store_scan(
            current_user=current_user,
            scan_type="message",
            title="Message safety check",
            verdict=verdict,
            risk_score=ai_result["risk_score"],
            summary=f"{verdict_label(verdict)}: {ai_result['recommended_action']}",
            explanation=ai_result["explanation"],
            advice=build_user_advice(verdict, "message"),
            input_text=message,
            findings=findings,
            extracted_urls=extract_urls(message),
            metadata={
                "channel": channel,
                "attack_prediction": ai_result["attack_prediction"],
                "tactic_prediction": ai_result["tactic_prediction"],
                "confidence": ai_result["confidence"],
                "tactics": ai_result.get("tactics", []),
                "citations": ai_result.get("citations", []),
                "provider_path": ai_result.get("provider_path", {}),
                "degraded_mode": ai_result.get("degraded_mode", False),
                "evidence_summary": ai_result.get("evidence_summary", []),
                "token_usage": ai_result.get("token_usage", {}),
            },
        )

    def check_voice(self, current_user: User, file_bytes: bytes, filename: str, transcript_hint: str | None) -> SafetyScanResponse:
        transcription = self.voice_service.transcribe(file_bytes=file_bytes, filename=filename, transcript_hint=transcript_hint)
        acoustic = self.voice_service.analyze_acoustics(file_bytes=file_bytes, filename=filename)
        if transcription.transcript:
            result = self.check_message(current_user, transcription.transcript, "voice")
            updated = self.repository.get_by_id(result.id)
            if updated:
                updated.scan_type = "voice"
                updated.title = "Voice message safety check"
                updated.transcript = transcription.transcript
                extra_limitations = transcription.limitations + acoustic.limitations
                updated.limitations_json = extra_limitations
                metadata = dict(updated.metadata_json or {})
                metadata["filename"] = filename
                metadata["used_transcript_hint"] = transcription.used_hint
                metadata["acoustic_analysis"] = {
                    "urgency_score": acoustic.urgency_score,
                    "stress_score": acoustic.stress_score,
                    "intensity_score": acoustic.intensity_score,
                    "findings": acoustic.findings,
                    "provider": acoustic.provider,
                }
                updated.metadata_json = metadata
                if acoustic.findings:
                    updated.findings_json = list(updated.findings_json or []) + [
                        {
                            "label": "Voice tone",
                            "value": "Acoustic signal analysis",
                            "note": finding,
                            "severity": "warning",
                        }
                        for finding in acoustic.findings
                    ]
                    updated.explanation = f"{updated.explanation} The voice delivery also added pressure cues: {' '.join(acoustic.findings)}".strip()
                    updated.risk_score = min(100, updated.risk_score + 8)
                    updated.summary = f"{verdict_label(risk_to_verdict(updated.risk_score))}: voice check complete."
                    updated.advice = build_user_advice(risk_to_verdict(updated.risk_score), 'voice')
                self.db.commit()
                self.db.refresh(updated)
                return self._serialize(updated)

        return self._store_scan(
            current_user=current_user,
            scan_type="voice",
            title="Voice message safety check",
            verdict="caution",
            risk_score=40,
            summary="Caution: we could not transcribe this voice note automatically.",
            explanation="We need a transcript before we can judge whether the message sounds manipulative or scam-like.",
            advice="If possible, paste what you heard or try again with automatic transcription configured.",
            transcript=transcription.transcript,
            limitations=transcription.limitations + acoustic.limitations,
            findings=[
                SafetyFinding(
                    label="Voice tone",
                    value="Acoustic signal analysis",
                    note=finding,
                    severity="warning",
                )
                for finding in acoustic.findings
            ],
            metadata={
                "filename": filename,
                "degraded_mode": True,
                "acoustic_analysis": {
                    "urgency_score": acoustic.urgency_score,
                    "stress_score": acoustic.stress_score,
                    "intensity_score": acoustic.intensity_score,
                    "findings": acoustic.findings,
                    "provider": acoustic.provider,
                },
            },
        )

    def check_email_text(self, current_user: User, raw_email_text: str) -> SafetyScanResponse:
        parsed = self.email_service.parse_raw_text(raw_email_text)
        combined_text = "\n".join(filter(None, [parsed.get("subject"), parsed.get("body"), parsed.get("reply_to"), parsed.get("sender")]))
        base = self.check_message(current_user, combined_text or raw_email_text, "email")
        stored = self.repository.get_by_id(base.id)
        if stored:
            stored.scan_type = "email"
            stored.title = "Email safety check"
            stored.parsed_email_json = parsed
            stored.extracted_urls_json = parsed.get("extracted_links", [])
            stored.metadata_json = {**(stored.metadata_json or {}), "attachments": parsed.get("attachments", [])}
            self.db.commit()
            self.db.refresh(stored)
            return self._serialize(stored)
        return base

    def check_email_upload(self, current_user: User, file_bytes: bytes) -> SafetyScanResponse:
        parsed = self.email_service.parse_eml_bytes(file_bytes)
        combined_text = "\n".join(filter(None, [parsed.get("subject"), parsed.get("body"), parsed.get("reply_to"), parsed.get("sender")]))
        base = self.check_message(current_user, combined_text, "email")
        stored = self.repository.get_by_id(base.id)
        if stored:
            stored.scan_type = "email"
            stored.title = "Email safety check"
            stored.parsed_email_json = parsed
            stored.extracted_urls_json = parsed.get("extracted_links", [])
            stored.metadata_json = {**(stored.metadata_json or {}), "attachments": parsed.get("attachments", [])}
            self.db.commit()
            self.db.refresh(stored)
            return self._serialize(stored)
        return base

    def check_attachment(self, current_user: User, filename: str, content_type: str | None, size_bytes: int) -> SafetyScanResponse:
        result = self.attachment_service.inspect(filename=filename, content_type=content_type, size_bytes=size_bytes)
        verdict = "risky" if result["verdict"] == "risky" else "caution" if result["verdict"] == "caution" else "safe"
        return self._store_scan(
            current_user=current_user,
            scan_type="attachment",
            title="Attachment safety check",
            verdict=verdict,
            risk_score=result["score"],
            summary=f"{verdict_label(verdict)}: attachment check complete.",
            explanation=" ".join(result["reasons"]),
            advice=build_user_advice(verdict, "attachment"),
            findings=[SafetyFinding(label="Attachment", value=filename, note=reason, severity="warning") for reason in result["reasons"]],
            limitations=result["limitations"],
            metadata={"content_type": content_type, "size_bytes": size_bytes, "extensions": result["extensions"]},
        )

    def check_link(self, current_user: User, url: str) -> SafetyScanResponse:
        result = self.url_service.inspect(url)
        verdict = "risky" if result["verdict"] == "suspicious" and result["score"] >= 65 else "caution" if result["score"] >= 35 else "safe"
        return self._store_scan(
            current_user=current_user,
            scan_type="link",
            title="Link safety check",
            verdict=verdict,
            risk_score=result["score"],
            summary=f"{verdict_label(verdict)}: link review complete.",
            explanation=" ".join(result["reasons"]),
            advice=build_user_advice(verdict, "link"),
            input_text=url,
            extracted_urls=[result["url"]],
            findings=[SafetyFinding(label="Link signal", value=result["url"], note=reason, severity="warning") for reason in result["reasons"]],
            limitations=result["limitations"],
            metadata={"host": result["host"]},
        )

    def check_hash(self, current_user: User, hash_value: str) -> SafetyScanResponse:
        result = self.hash_service.inspect(hash_value)
        verdict = "caution" if result["verdict"] == "caution" else "safe"
        return self._store_scan(
            current_user=current_user,
            scan_type="hash",
            title="Hash safety check",
            verdict=verdict,
            risk_score=result["score"],
            summary=f"{verdict_label(verdict)}: hash review complete.",
            explanation=" ".join(result["reasons"]),
            advice=build_user_advice(verdict, "file hash"),
            input_text=hash_value,
            findings=[SafetyFinding(label="Hash note", value=result["hash_value"], note=reason, severity="info") for reason in result["reasons"]],
            limitations=result["limitations"],
            metadata={"hash_type": result["hash_type"]},
        )

    def check_image_privacy(self, current_user: User, image_bytes: bytes, filename: str) -> SafetyScanResponse:
        result = self.image_service.inspect(image_bytes, filename)
        verdict = "private_info_detected" if result["verdict"] == "private_info_detected" else "caution" if result["score"] >= 20 else "safe"
        return self._store_scan(
            current_user=current_user,
            scan_type="image_privacy",
            title="Image privacy check",
            verdict=verdict,
            risk_score=result["score"],
            summary="Private information may be visible in this image." if verdict == "private_info_detected" else "Image privacy check complete.",
            explanation=result["extracted_text"] or "We scanned the visible text in the image and checked it for private details.",
            advice=build_user_advice(verdict, "image"),
            findings=[SafetyFinding(**{key: value for key, value in finding.items() if key in {"label", "value", "note", "severity"}}) for finding in result["findings"]],
            limitations=result["limitations"],
            metadata={"ocr_text": result["extracted_text"], **(result["metadata"] or {}), "boxes": [finding.get("box") for finding in result["findings"] if finding.get("box")]},
        )

    def webhook_check(self, payload: dict[str, Any]) -> dict[str, Any]:
        if payload.get("url"):
            return self.url_service.inspect(payload["url"])
        if payload.get("email_text"):
            parsed = self.email_service.parse_raw_text(payload["email_text"])
            combined_text = "\n".join(filter(None, [parsed.get("subject"), parsed.get("body"), parsed.get("reply_to"), parsed.get("sender")]))
            ai_result = self.pipeline.analyze_message(combined_text or payload["email_text"], payload.get("channel", "email"))
            return {"kind": "email", "parsed_email": parsed, "risk_score": ai_result["risk_score"], "explanation": ai_result["explanation"]}
        if payload.get("message"):
            ai_result = self.pipeline.analyze_message(payload["message"], payload.get("channel", "message"))
            return {"kind": "message", "risk_score": ai_result["risk_score"], "explanation": ai_result["explanation"]}
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook payload must include message, email_text, or url")

    def history(self, current_user: User, limit: int | None = None) -> SafetyScanHistoryResponse:
        items = [self._serialize(item) for item in self.repository.get_history(current_user.id, limit=limit)]
        return SafetyScanHistoryResponse(items=items)

    def get(self, current_user: User, scan_id: str) -> SafetyScanResponse:
        scan = self.repository.get_by_id(scan_id)
        if not scan or scan.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety scan not found")
        return self._serialize(scan)

    def _store_scan(
        self,
        *,
        current_user: User,
        scan_type: str,
        title: str,
        verdict: str,
        risk_score: int,
        summary: str,
        explanation: str,
        advice: str,
        input_text: str | None = None,
        transcript: str | None = None,
        findings: list[SafetyFinding] | None = None,
        extracted_urls: list[str] | None = None,
        parsed_email: dict[str, Any] | None = None,
        limitations: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> SafetyScanResponse:
        scan = SafetyScan(
            user_id=current_user.id,
            scan_type=scan_type,
            title=title,
            verdict=verdict,
            risk_score=risk_score,
            summary=summary,
            explanation=explanation,
            advice=advice,
            input_text=input_text,
            transcript=transcript,
            findings_json=[item.model_dump() for item in (findings or [])],
            extracted_urls_json=extracted_urls or [],
            parsed_email_json=parsed_email,
            limitations_json=limitations or [],
            metadata_json=metadata or {},
        )
        saved = self.repository.create(scan)
        record_risk(scan_type, risk_score)
        self.audit.log(current_user.id, "safety_scan.create", f"Created {scan_type} scan {saved.id}")
        return self._serialize(saved)

    @staticmethod
    def _serialize(scan: SafetyScan) -> SafetyScanResponse:
        return SafetyScanResponse(
            id=scan.id,
            scan_type=scan.scan_type,
            title=scan.title,
            verdict=scan.verdict,
            risk_score=scan.risk_score,
            summary=scan.summary,
            explanation=scan.explanation,
            advice=scan.advice,
            confidence=(scan.metadata_json or {}).get("confidence"),
            created_at=scan.created_at,
            input_text=scan.input_text,
            transcript=scan.transcript,
            extracted_urls=scan.extracted_urls_json or [],
            findings=[SafetyFinding(**item) for item in (scan.findings_json or [])],
            tactics=(scan.metadata_json or {}).get("tactics", []),
            citations=(scan.metadata_json or {}).get("citations", []),
            parsed_email=scan.parsed_email_json,
            limitations=scan.limitations_json or [],
            degraded_mode=bool((scan.metadata_json or {}).get("degraded_mode", False)),
            metadata=scan.metadata_json,
        )
