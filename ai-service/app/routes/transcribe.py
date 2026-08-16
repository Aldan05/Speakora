import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.models.schemas import TranscribeResponse
from app.services.whisper_service import whisper_service
from app.utils.audio_utils import validate_and_save_temp_audio, cleanup_temp_file, calculate_words_spoken

router = APIRouter()

@router.post("/api/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    x_ai_secret: str = Header(None, alias="X-AI-Secret")
):
    # Service-to-service secret validation if configured
    expected_secret = os.getenv("AI_SERVICE_SECRET", "your_super_secret_ai_key")
    if expected_secret and x_ai_secret != expected_secret:
        raise HTTPException(status_code=403, detail="Unauthorized AI service access.")

    temp_path = None
    try:
        temp_path = validate_and_save_temp_audio(audio)
        result = whisper_service.transcribe(temp_path)
        
        words = calculate_words_spoken(result["transcript"])

        return {
            "success": True,
            "transcript": result["transcript"],
            "language": result["language"],
            "duration": result["duration"],
            "wordsSpoken": words,
            "message": "Transcription completed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whisper processing failed: {str(e)}")
    finally:
        if temp_path:
            cleanup_temp_file(temp_path)
