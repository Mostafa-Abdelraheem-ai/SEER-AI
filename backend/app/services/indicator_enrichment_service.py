from __future__ import annotations

from dataclasses import dataclass


@dataclass
class IndicatorEnrichmentResult:
    provider: str
    verdict: str
    score_delta: int
    reasons: list[str]
    metadata: dict


class IndicatorEnrichmentProvider:
    name = "base"

    def enrich_url(self, url: str, host: str) -> IndicatorEnrichmentResult | None:
        return None

    def enrich_hash(self, hash_value: str, hash_type: str | None) -> IndicatorEnrichmentResult | None:
        return None


class LocalIndicatorKnowledgeProvider(IndicatorEnrichmentProvider):
    name = "local_knowledge"

    def enrich_url(self, url: str, host: str) -> IndicatorEnrichmentResult | None:
        if host.endswith(".ru") or host.endswith(".zip") or "login" in url.lower():
            return IndicatorEnrichmentResult(
                provider=self.name,
                verdict="caution",
                score_delta=10,
                reasons=["Local threat heuristics flagged the destination as higher risk based on host naming patterns."],
                metadata={"host": host},
            )
        return None

    def enrich_hash(self, hash_value: str, hash_type: str | None) -> IndicatorEnrichmentResult | None:
        if hash_type == "md5":
            return IndicatorEnrichmentResult(
                provider=self.name,
                verdict="caution",
                score_delta=5,
                reasons=["MD5 is weak for trust decisions and should not be treated as reputation by itself."],
                metadata={"hash_type": hash_type},
            )
        return None


class IndicatorEnrichmentService:
    def __init__(self) -> None:
        self.providers: list[IndicatorEnrichmentProvider] = [LocalIndicatorKnowledgeProvider()]

    def enrich_url(self, url: str, host: str) -> list[IndicatorEnrichmentResult]:
        return [result for provider in self.providers if (result := provider.enrich_url(url, host))]

    def enrich_hash(self, hash_value: str, hash_type: str | None) -> list[IndicatorEnrichmentResult]:
        return [result for provider in self.providers if (result := provider.enrich_hash(hash_value, hash_type))]
