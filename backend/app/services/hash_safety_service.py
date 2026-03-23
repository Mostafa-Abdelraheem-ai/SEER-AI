from __future__ import annotations

import re

from app.services.indicator_enrichment_service import IndicatorEnrichmentService


HASH_PATTERNS = {
    "md5": re.compile(r"^[a-fA-F0-9]{32}$"),
    "sha1": re.compile(r"^[a-fA-F0-9]{40}$"),
    "sha256": re.compile(r"^[a-fA-F0-9]{64}$"),
}


class HashSafetyService:
    def __init__(self) -> None:
        self.enrichment = IndicatorEnrichmentService()

    def inspect(self, hash_value: str) -> dict:
        normalized = hash_value.strip().lower()
        hash_type = next((name for name, pattern in HASH_PATTERNS.items() if pattern.match(normalized)), None)

        if not hash_type:
            return {
                "hash_value": hash_value,
                "score": 45,
                "verdict": "caution",
                "hash_type": None,
                "reasons": ["The value does not look like a valid MD5, SHA1, or SHA256 hash."],
                "limitations": ["We could not compare this value against an external threat database."],
            }

        enrichments = self.enrichment.enrich_hash(normalized, hash_type)
        score = 15 + sum(item.score_delta for item in enrichments)
        reasons = ["The hash format looks valid."] + [reason for item in enrichments for reason in item.reasons]
        verdict = "likely_safe" if score < 35 else "caution"

        return {
            "hash_value": normalized,
            "score": score,
            "verdict": verdict,
            "hash_type": hash_type,
            "reasons": reasons,
            "enrichments": [item.__dict__ for item in enrichments],
            "limitations": [
                "We could not verify this hash against a live threat database in the current local setup.",
                "A valid hash format does not prove the file is safe.",
            ],
        }
