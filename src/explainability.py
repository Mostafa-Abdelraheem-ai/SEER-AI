from __future__ import annotations

from typing import Dict, List

from src.preprocessing import highlight_terms


def suspicious_keywords_from_rules(triggered_rules: List[str]) -> List[str]:
    keywords = []
    for rule in triggered_rules:
        keywords.extend(rule.split(":")[-1].split(","))
    return [keyword.strip() for keyword in keywords if keyword.strip()]


def build_plain_english_explanation(result: Dict[str, object]) -> str:
    attack = result.get("attack_prediction", "unknown")
    tactic = result.get("tactic_prediction", "unknown")
    rules = result.get("triggered_rules", [])
    confidence = result.get("confidence", 0.0)
    reasons = ", ".join(rules[:3]) if rules else "few explicit rule matches"
    return (
        f"This message is classified as {attack} with tactic {tactic}. "
        f"Confidence is {confidence:.2f}, and the strongest indicators are {reasons}."
    )


def explain_message(text: str, result: Dict[str, object]) -> Dict[str, object]:
    keywords = suspicious_keywords_from_rules(result.get("triggered_rules", []))
    return {
        "highlighted_text": highlight_terms(text, keywords),
        "triggered_rules": result.get("triggered_rules", []),
        "retrieved_snippets": [chunk["text"] for chunk in result.get("retrieved_chunks", [])[:3]],
        "plain_english": build_plain_english_explanation(result),
    }
