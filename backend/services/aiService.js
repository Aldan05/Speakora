const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || "your_super_secret_ai_key";

/**
 * Sends audio file to FastAPI for Whisper transcription
 */
const transcribeAudio = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file does not exist on disk.");
  }

  const formData = new FormData();
  formData.append("audio", fs.createReadStream(filePath));

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/transcribe`, formData, {
      headers: {
        ...formData.getHeaders(),
        "X-AI-Secret": AI_SERVICE_SECRET,
      },
      timeout: 120000,
    });

    if (response.data && response.data.success) {
      return {
        transcript: response.data.transcript,
        language: response.data.language,
        duration: response.data.duration,
        wordsSpoken: response.data.wordsSpoken,
      };
    } else {
      throw new Error(response.data?.message || "Transcription failed in AI service.");
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("AI transcription service is currently unavailable.");
    }
    throw new Error(error.response?.data?.detail || "Error during AI transcription processing.");
  }
};

/**
 * Sends transcript & metadata to FastAPI for NLP analysis, scoring, and feedback
 */
const analyzeTranscript = async (transcript, duration, language = "en") => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/analyze`,
      {
        transcript,
        duration,
        language,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-AI-Secret": AI_SERVICE_SECRET,
        },
        timeout: 60000,
      }
    );

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error("Analysis failed in AI service.");
    }
  } catch (error) {
    console.error("AI Analysis Service Error:", error.response?.data?.detail || error.message);
    throw new Error(error.response?.data?.detail || "Error during transcript analysis processing.");
  }
};

module.exports = {
  transcribeAudio,
  analyzeTranscript,
};
