from __future__ import annotations

import re
from io import BytesIO

from PIL import Image, ImageFilter, ImageOps

from app.core.config import get_settings

try:
    import pytesseract
except Exception:  # pragma: no cover
    pytesseract = None


SENSITIVE_PATTERNS = {
    "Email address": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "Phone number": re.compile(r"(?:\+?\d[\d\s().-]{7,}\d)"),
    "Card-like number": re.compile(r"\b(?:\d[ -]*?){13,19}\b"),
    "National ID-like number": re.compile(r"\b\d{9,14}\b"),
    "Address hint": re.compile(r"\b\d{1,5}\s+[A-Za-z0-9.\- ]+\s(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr)\b", re.IGNORECASE),
    "Passport-like code": re.compile(r"\b[A-Z]{1,2}\d{6,9}\b"),
}


class ImagePrivacyService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @staticmethod
    def _preprocess(image: Image.Image) -> list[tuple[str, Image.Image]]:
        rgb = image.convert("RGB")
        gray = ImageOps.grayscale(rgb)
        enhanced = ImageOps.autocontrast(gray)
        sharp = enhanced.filter(ImageFilter.SHARPEN)
        binary = sharp.point(lambda pixel: 255 if pixel > 155 else 0)
        upscaled = sharp.resize((sharp.width * 2, sharp.height * 2))
        return [
            ("raw", rgb),
            ("enhanced", sharp),
            ("binary", binary),
            ("upscaled", upscaled),
        ]

    def inspect(self, image_bytes: bytes, filename: str) -> dict:
        if not self.settings.enable_ocr:
            return {
                "extracted_text": "",
                "findings": [],
                "score": 15,
                "verdict": "caution",
                "limitations": [
                    "OCR is disabled in lightweight mode.",
                    "Enable ENABLE_OCR=true if you want image text scanning.",
                ],
                "metadata": {"filename": filename, "ocr_disabled": True},
            }
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
        words = []
        best_text = ""
        best_confidence = -1.0
        for variant_name, variant in self._preprocess(image):
            ocr_data = pytesseract.image_to_data(variant, output_type=pytesseract.Output.DICT)
            candidate_words = []
            confidences = []
            for index, text in enumerate(ocr_data["text"]):
                value = (text or "").strip()
                if not value:
                    continue
                confidence_raw = ocr_data["conf"][index]
                try:
                    confidence = float(confidence_raw)
                except Exception:
                    confidence = -1.0
                if confidence >= 0:
                    confidences.append(confidence)
                candidate_words.append(
                    {
                        "text": value,
                        "left": int(ocr_data["left"][index]),
                        "top": int(ocr_data["top"][index]),
                        "width": int(ocr_data["width"][index]),
                        "height": int(ocr_data["height"][index]),
                        "variant": variant_name,
                    }
                )
            candidate_text = " ".join(word["text"] for word in candidate_words)
            average_confidence = sum(confidences) / len(confidences) if confidences else -1.0
            if len(candidate_text) > len(best_text) or average_confidence > best_confidence:
                best_text = candidate_text
                best_confidence = average_confidence
                words = candidate_words

        extracted_text = best_text
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
            "metadata": {"filename": filename, "image_size": image.size, "ocr_confidence_estimate": round(max(best_confidence, 0.0), 2)},
        }
