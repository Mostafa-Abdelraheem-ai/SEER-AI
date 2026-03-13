# SOC Playbooks for Message Triage

When a suspicious message is reported:

1. Preserve the original message content and metadata.
2. Identify whether the message asks for credentials, payment, secrecy, or urgent action.
3. Review URLs, sender identity, reply-to mismatches, and lookalike domains.
4. Contact the purported requester through a trusted channel before any action.
5. If risk is high, block sender infrastructure and notify affected users.
6. Do not claim confirmed compromise from message text alone without endpoint or account telemetry.
