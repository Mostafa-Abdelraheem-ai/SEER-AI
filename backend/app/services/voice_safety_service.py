from __future__ import annotations

from dataclasses import dataclass
import io

from openai import OpenAI

from app.core.config import get_settings


@dataclass
class VoiceTranscriptionResult:
    transcript: str | None
    limitations: list[str]
    used_hint: bool = False


class VoiceSafetyService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def transcribe(self, file_bytes: bytes, filename: str, transcript_hint: str | None = None) -> VoiceTranscriptionResult:
        if transcript_hint and transcript_hint.strip():
            return VoiceTranscriptionResult(
                transcript=transcript_hint.strip(),
                limitations=["This result used the text you provided as a transcript hint."],
                used_hint=True,
            )

        api_key = self.settings.openai_api_key
        if api_key:
            client = OpenAI(api_key=api_key)
            audio_file = io.BytesIO(file_bytes)
            audio_file.name = filename
            result = client.audio.transcriptions.create(model=self.settings.audio_transcription_model, file=audio_file)
            transcript = getattr(result, "text", None) or ""
            return VoiceTranscriptionResult(transcript=transcript.strip(), limitations=[])

        return VoiceTranscriptionResult(
            transcript=None,
            limitations=[
                "Automatic transcription is not configured in this local setup.",
                "You can still paste what you heard so we can check it for scam pressure and manipulation.",
            ],
        )
