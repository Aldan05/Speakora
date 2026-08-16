import os
import shutil
import tempfile
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {".webm", ".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac"}
MAX_SIZE_BYTES = int(os.getenv("MAX_AUDIO_SIZE_MB", "25")) * 1024 * 1024

def validate_and_save_temp_audio(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".webm"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    try:
        size = 0
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_SIZE_BYTES:
                temp_file.close()
                os.unlink(temp_file.name)
                raise HTTPException(status_code=413, detail=f"Audio size exceeds {os.getenv('MAX_AUDIO_SIZE_MB', '25')} MB limit.")
            temp_file.write(chunk)
        temp_file.close()
        return temp_file.name
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=f"Failed to process temporary audio file: {str(e)}")

def cleanup_temp_file(file_path: str):
    if file_path and os.path.exists(file_path):
        try:
            os.unlink(file_path)
        except Exception as e:
            print(f"Warning: Failed to cleanup temp file {file_path}: {e}")

def calculate_words_spoken(transcript: str) -> int:
    if not transcript or not transcript.strip():
        return 0
    words = [w for w in transcript.strip().split() if w.strip()]
    return len(words)
