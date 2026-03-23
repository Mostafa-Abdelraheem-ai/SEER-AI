from __future__ import annotations

from email import policy
from email.parser import BytesParser, Parser

from app.services.attachment_safety_service import AttachmentSafetyService
from app.services.url_safety_service import extract_urls


class EmailSafetyService:
    def __init__(self) -> None:
        self.attachment_inspector = AttachmentSafetyService()

    def parse_raw_text(self, raw_email_text: str) -> dict:
        message = Parser(policy=policy.default).parsestr(raw_email_text)
        return self._serialize_message(message)

    def parse_eml_bytes(self, data: bytes) -> dict:
        message = BytesParser(policy=policy.default).parsebytes(data)
        return self._serialize_message(message)

    def _serialize_message(self, message) -> dict:
        body_parts: list[str] = []
        attachments: list[dict] = []

        if message.is_multipart():
            for part in message.walk():
                disposition = part.get_content_disposition()
                if disposition == "attachment":
                    filename = part.get_filename() or "attachment"
                    payload = part.get_payload(decode=True) or b""
                    attachments.append(
                        self.attachment_inspector.inspect(
                            filename=filename,
                            content_type=part.get_content_type(),
                            size_bytes=len(payload),
                        )
                    )
                elif part.get_content_type() == "text/plain" and disposition != "attachment":
                    body_parts.append(part.get_content())
        else:
            body_parts.append(message.get_content())

        body = "\n".join(part.strip() for part in body_parts if part and part.strip())
        links = extract_urls(body)

        return {
            "sender": message.get("From"),
            "subject": message.get("Subject"),
            "reply_to": message.get("Reply-To"),
            "body": body,
            "extracted_links": links,
            "attachments": attachments,
        }
