import os
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.analysis_service import analysis_service

router = APIRouter()

class AnalyzeRequest(BaseModel):
    transcript: str
    duration: float
    language: Optional[str] = "en"

@router.post("/api/analyze")
async def analyze_transcript(
    payload: AnalyzeRequest,
    x_ai_secret: str = Header(None, alias="X-AI-Secret")
):
    expected_secret = os.getenv("AI_SERVICE_SECRET", "your_super_secret_ai_key")
    if expected_secret and x_ai_secret != expected_secret:
        raise HTTPException(status_code=403, detail="Unauthorized AI service access.")

    try:
        results = analysis_service.analyze_transcript(
            transcript=payload.transcript,
            duration=payload.duration,
            language=payload.language or "en"
        )
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis processing failed: {str(e)}")
