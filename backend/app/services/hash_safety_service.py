from __future__ import annotations

import re


HASH_PATTERNS = {
    "md5": re.compile(r"^[a-fA-F0-9]{32}$"),
    "sha1": re.compile(r"^[a-fA-F0-9]{40}$"),
    "sha256": re.compile(r"^[a-fA-F0-9]{64}$"),
}


class HashSafetyService:
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

        return {
            "hash_value": normalized,
            "score": 15,
            "verdict": "likely_safe",
            "hash_type": hash_type,
            "reasons": ["The hash format looks valid."],
            "limitations": [
                "We could not verify this hash against a live threat database in the current local setup.",
                "A valid hash format does not prove the file is safe.",
            ],
        }
