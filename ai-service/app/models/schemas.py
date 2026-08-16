from pydantic import BaseModel
from typing import Optional

class HealthResponse(BaseModel):
    status: str
    service: str
    whisper: bool

class TranscribeResponse(BaseModel):
    success: bool
    transcript: str
    language: str
    duration: float
    wordsSpoken: int
    message: Optional[str] = None
