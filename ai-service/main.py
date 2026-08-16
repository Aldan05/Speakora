import os
import logging
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from app.routes import transcribe, analyze, health
from app.services.whisper_service import whisper_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_main")

app = FastAPI(title="Speakora AI Service", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Speakora AI FastAPI Service...")
    try:
        whisper_service.load_model()
    except Exception as e:
        logger.warning(f"Whisper model deferred loading until first request: {e}")

app.include_router(health.router)
app.include_router(transcribe.router)
app.include_router(analyze.router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
