from __future__ import annotations

import re
from io import BytesIO

from PIL import Image

try:
    import pytesseract
except Exception:  # pragma: no cover
    pytesseract = None


SENSITIVE_PATTERNS = {
    "Email address": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "Phone number": re.compile(r"(?:\+?\d[\d\s().-]{7,}\d)"),
    "Card-like number": re.compile(r"\b(?:\d[ -]*?){13,19}\b"),
}


class ImagePrivacyService:
    def inspect(self, image_bytes: bytes, filename: str) -> dict:
        if pytesseract is None:
            return {
                "extracted_text": "",
                "findings": [],
                "score": 25,
                "verdict": "caution",
                "limitations": [
                    "OCR is not available because pytesseract is not installed.",
                    "Install pytesseract and the Tesseract OCR system package to enable image text scanning.",
                ],
                "metadata": {"filename": filename},
            }

        image = Image.open(BytesIO(image_bytes))
        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        words = []
        for index, text in enumerate(ocr_data["text"]):
            value = (text or "").strip()
            if not value:
                continue
            words.append(
                {
                    "text": value,
                    "left": int(ocr_data["left"][index]),
                    "top": int(ocr_data["top"][index]),
                    "width": int(ocr_data["width"][index]),
                    "height": int(ocr_data["height"][index]),
                }
            )

        extracted_text = " ".join(word["text"] for word in words)
        findings = []
        for label, pattern in SENSITIVE_PATTERNS.items():
            for match in pattern.finditer(extracted_text):
                matched_text = match.group(0)
                hit_words = [word for word in words if word["text"] in matched_text]
                box = None
                if hit_words:
                    left = min(word["left"] for word in hit_words)
                    top = min(word["top"] for word in hit_words)
                    right = max(word["left"] + word["width"] for word in hit_words)
                    bottom = max(word["top"] + word["height"] for word in hit_words)
                    box = {"left": left, "top": top, "width": right - left, "height": bottom - top}
                findings.append(
                    {
                        "label": label,
                        "value": matched_text,
                        "note": f"{label} may be visible in this image.",
                        "severity": "warning",
                        "box": box,
                    }
                )

        verdict = "private_info_detected" if findings else "safe"
        score = 80 if findings else 10
        limitations = [
            "OCR can miss small, blurry, or stylized text.",
            "Sensitive-info detection is a best-effort pattern check, not a guarantee.",
        ]
        return {
            "extracted_text": extracted_text,
            "findings": findings,
            "score": score,
            "verdict": verdict,
            "limitations": limitations,
            "metadata": {"filename": filename, "image_size": image.size},
        }
