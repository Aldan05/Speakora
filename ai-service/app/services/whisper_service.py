import os
import whisper
import logging
import imageio_ffmpeg

logger = logging.getLogger("whisper_service")

class WhisperService:
    def __init__(self):
        self.model = None
        self.model_name = os.getenv("WHISPER_MODEL", "tiny")
        self._ensure_ffmpeg_in_path()

    def _ensure_ffmpeg_in_path(self):
        # Automatically inject static ffmpeg binary directory into system PATH for Windows
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_dir = os.path.dirname(ffmpeg_exe)
        
        # Add ffmpeg directory to PATH
        path_env = os.environ.get("PATH", "")
        if ffmpeg_dir not in path_env:
            os.environ["PATH"] = ffmpeg_dir + os.pathsep + path_env
            logger.info(f"Added FFmpeg directory to PATH: {ffmpeg_dir}")

        # Also create copy named ffmpeg.exe if needed
        ffmpeg_alias = os.path.join(ffmpeg_dir, "ffmpeg.exe")
        if not os.path.exists(ffmpeg_alias):
            import shutil
            try:
                shutil.copyfile(ffmpeg_exe, ffmpeg_alias)
                logger.info(f"Created FFmpeg alias at {ffmpeg_alias}")
            except Exception as e:
                logger.warning(f"Could not create FFmpeg alias: {e}")

    def load_model(self):
        if self.model is None:
            logger.info(f"Loading Whisper model '{self.model_name}' into memory...")
            try:
                self.model = whisper.load_model(self.model_name)
                logger.info(f"Whisper model '{self.model_name}' loaded successfully!")
            except Exception as e:
                logger.error(f"Failed to load Whisper model: {e}")
                self.model = None
                raise e

    def transcribe(self, audio_path: str):
        if self.model is None:
            self.load_model()

        logger.info(f"Transcribing audio file: {audio_path}")
        result = self.model.transcribe(audio_path, language="en", fp16=False)
        
        transcript = result.get("text", "").strip()
        language = result.get("language", "en")
        
        duration = 0.0
        segments = result.get("segments", [])
        if segments:
            duration = round(segments[-1].get("end", 0.0), 1)

        return {
            "transcript": transcript,
            "language": language,
            "duration": duration,
        }

whisper_service = WhisperService()
