from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.whisper_service import whisper_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    is_whisper_ready = whisper_service.model is not None
    return {
        "status": "ok",
        "service": "Speakora AI",
        "whisper": is_whisper_ready
    }
