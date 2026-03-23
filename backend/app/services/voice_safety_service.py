from __future__ import annotations

from dataclasses import dataclass
import io
import wave

import numpy as np

from openai import OpenAI

from app.core.config import get_settings
from app.observability.metrics import record_pipeline_event, track_duration


@dataclass
class VoiceTranscriptionResult:
    transcript: str | None
    limitations: list[str]
    used_hint: bool = False


@dataclass
class VoiceAcousticResult:
    urgency_score: float
    stress_score: float
    intensity_score: float
    findings: list[str]
    limitations: list[str]
    provider: str = "signal"


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
            with track_duration("voice_transcription", "openai"):
                result = client.audio.transcriptions.create(model=self.settings.audio_transcription_model, file=audio_file)
            transcript = getattr(result, "text", None) or ""
            return VoiceTranscriptionResult(transcript=transcript.strip(), limitations=[])

        record_pipeline_event("voice_transcription", "fallback_to_hint")
        return VoiceTranscriptionResult(
            transcript=None,
            limitations=[
                "Automatic transcription is not configured in this local setup.",
                "You can still paste what you heard so we can check it for scam pressure and manipulation.",
            ],
        )

    def analyze_acoustics(self, file_bytes: bytes, filename: str) -> VoiceAcousticResult:
        if not filename.lower().endswith(".wav"):
            return VoiceAcousticResult(
                urgency_score=0.0,
                stress_score=0.0,
                intensity_score=0.0,
                findings=[],
                limitations=["Acoustic analysis currently supports WAV files best. Other formats fall back to transcript-first analysis."],
            )

        try:
            with track_duration("voice_acoustics", self.settings.voice_acoustic_provider):
                with wave.open(io.BytesIO(file_bytes), "rb") as wav_file:
                    frame_rate = wav_file.getframerate()
                    sample_width = wav_file.getsampwidth()
                    frame_count = wav_file.getnframes()
                    channels = wav_file.getnchannels()
                    frames = wav_file.readframes(frame_count)

            dtype = np.int16 if sample_width == 2 else np.int8
            samples = np.frombuffer(frames, dtype=dtype).astype(np.float32)
            if channels > 1:
                samples = samples.reshape(-1, channels).mean(axis=1)
            max_abs = max(float(np.max(np.abs(samples))), 1.0)
            normalized = samples / max_abs
            energy = float(np.sqrt(np.mean(normalized**2)))
            zcr = float(np.mean(np.abs(np.diff(np.signbit(normalized).astype(np.float32)))))
            window = max(int(frame_rate * 0.12), 1)
            envelope = np.array([np.mean(np.abs(normalized[index:index + window])) for index in range(0, len(normalized), window)])
            speaking_windows = envelope[envelope > 0.08]
            pause_ratio = 1.0 - (len(speaking_windows) / max(len(envelope), 1))
            urgency = min(1.0, (energy * 1.9) + (zcr * 0.8))
            stress = min(1.0, (energy * 1.5) + ((1.0 - pause_ratio) * 0.5))
            intensity = min(1.0, (energy * 2.0) + (np.std(envelope) if len(envelope) else 0.0))
            findings: list[str] = []
            if urgency >= 0.65:
                findings.append("The speaker sounds fast-moving or urgent.")
            if stress >= 0.68:
                findings.append("The voice has elevated stress or pressure markers.")
            if intensity >= 0.7:
                findings.append("The audio energy is high, which can signal strong emotional pressure.")
            return VoiceAcousticResult(
                urgency_score=round(urgency, 4),
                stress_score=round(stress, 4),
                intensity_score=round(intensity, 4),
                findings=findings,
                limitations=["Acoustic scoring is heuristic and works best on clean single-speaker WAV audio."],
            )
        except Exception:
            record_pipeline_event("voice_acoustics", "analysis_failed")
            return VoiceAcousticResult(
                urgency_score=0.0,
                stress_score=0.0,
                intensity_score=0.0,
                findings=[],
                limitations=["We could not extract stable acoustic features from this file, so the result is transcript-led."],
            )
