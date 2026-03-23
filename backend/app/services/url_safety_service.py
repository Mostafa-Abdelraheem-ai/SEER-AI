from __future__ import annotations

import ipaddress
import re
from urllib.parse import urlparse

from app.services.indicator_enrichment_service import IndicatorEnrichmentService


URL_REGEX = re.compile(r"https?://[^\s<>\"]+|www\.[^\s<>\"]+", re.IGNORECASE)
SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "buff.ly", "is.gd"}
SUSPICIOUS_TLDS = {".zip", ".top", ".click", ".gq", ".tk", ".ru", ".work", ".country"}
SUSPICIOUS_KEYWORDS = {"verify", "urgent", "secure", "password", "wallet", "gift", "claim", "reset", "bonus", "crypto"}


def extract_urls(text: str) -> list[str]:
    if not text:
        return []
    urls = [match.group(0) for match in URL_REGEX.finditer(text)]
    normalized = []
    for url in urls:
        normalized.append(url if url.startswith("http") else f"https://{url}")
    return list(dict.fromkeys(normalized))


class UrlSafetyService:
    def __init__(self) -> None:
        self.enrichment = IndicatorEnrichmentService()

    def inspect(self, url: str) -> dict:
        parsed = urlparse(url if url.startswith("http") else f"https://{url}")
        host = (parsed.netloc or parsed.path).lower()
        reasons: list[str] = []
        score = 5

        if not host:
            return {
                "url": url,
                "score": 75,
                "verdict": "suspicious",
                "reasons": ["The link format looks unusual or incomplete."],
                "limitations": ["We did not visit the site directly."],
            }

        host_without_port = host.split(":")[0]
        try:
            ipaddress.ip_address(host_without_port)
            reasons.append("It uses a raw IP address instead of a normal website name.")
            score += 35
        except ValueError:
            pass

        if host_without_port in SHORTENERS:
            reasons.append("It uses a shortened link, which can hide the real destination.")
            score += 22

        if "xn--" in host_without_port:
            reasons.append("It contains punycode, which can be used to mimic trusted names.")
            score += 25

        if any(keyword in url.lower() for keyword in SUSPICIOUS_KEYWORDS):
            reasons.append("It contains words often used in scam or account-pressure links.")
            score += 18

        if any(host_without_port.endswith(tld) for tld in SUSPICIOUS_TLDS):
            reasons.append("It uses a domain ending that often appears in risky or low-trust links.")
            score += 18

        if host_without_port.count("-") >= 3:
            reasons.append("It uses a long or oddly formatted website name.")
            score += 10

        if parsed.query and len(parsed.query) > 80:
            reasons.append("It includes a long tracking or redirect-style query string.")
            score += 10

        enrichments = self.enrichment.enrich_url(parsed.geturl(), host_without_port)
        for enrichment in enrichments:
            reasons.extend(enrichment.reasons)
            score += enrichment.score_delta

        verdict = "likely_safe"
        if score >= 65:
            verdict = "suspicious"
        elif score >= 35:
            verdict = "caution"

        if not reasons:
            reasons.append("We did not find strong local warning signs in the link format.")

        return {
            "url": parsed.geturl(),
            "host": host_without_port,
            "score": min(score, 100),
            "verdict": verdict,
            "reasons": reasons,
            "enrichments": [item.__dict__ for item in enrichments],
            "limitations": [
                "We did not visit the website directly.",
                "A normal-looking link can still be unsafe.",
            ],
        }
