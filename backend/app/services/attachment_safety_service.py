from __future__ import annotations

from pathlib import Path


SUSPICIOUS_EXTENSIONS = {".exe", ".scr", ".js", ".vbs", ".bat", ".cmd", ".com", ".jar", ".msi", ".iso"}
MACRO_EXTENSIONS = {".docm", ".xlsm", ".pptm", ".xlsb"}
ARCHIVE_EXTENSIONS = {".zip", ".rar", ".7z", ".iso"}


class AttachmentSafetyService:
    def inspect(self, filename: str, content_type: str | None = None, size_bytes: int | None = None) -> dict:
        suffixes = [suffix.lower() for suffix in Path(filename).suffixes]
        reasons: list[str] = []
        score = 5

        if len(suffixes) >= 2 and suffixes[-1] in {".pdf", ".doc", ".docx", ".jpg", ".png"}:
            reasons.append("This file name uses multiple extensions, which can be used to hide the real file type.")
            score += 28

        if suffixes and suffixes[-1] in SUSPICIOUS_EXTENSIONS:
            reasons.append("This file type can directly run code on a device.")
            score += 40
        elif suffixes and suffixes[-1] in MACRO_EXTENSIONS:
            reasons.append("This office file type can contain macros or scripted actions.")
            score += 28
        elif suffixes and suffixes[-1] in ARCHIVE_EXTENSIONS:
            reasons.append("Archive files can hide other risky files inside them.")
            score += 18

        if filename.count(".") >= 2:
            reasons.append("The file name structure is unusual and deserves extra caution.")
            score += 10

        if size_bytes is not None and size_bytes == 0:
            reasons.append("The uploaded file appears empty or incomplete.")
            score += 10

        verdict = "safe"
        if score >= 60:
            verdict = "risky"
        elif score >= 30:
            verdict = "caution"

        if not reasons:
            reasons.append("We did not see a common scam-related file naming pattern.")

        return {
            "filename": filename,
            "content_type": content_type,
            "size_bytes": size_bytes,
            "score": min(score, 100),
            "verdict": verdict,
            "reasons": reasons,
            "extensions": suffixes,
            "limitations": ["This is a metadata-only check. It is not a malware sandbox or antivirus scan."],
        }
