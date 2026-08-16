# 🚀 Speakora — Production-Ready AI Speaking Analysis Platform

Speakora is an enterprise-grade, full-stack AI-powered English speaking practice and feedback application. It enables students to improve their spoken English skills through automated speech recognition (OpenAI Whisper) and natural language processing (LanguageTool + vocabulary analytics), while providing administrators with a real-time monitoring and analytics command center.

---

## 🌟 Key Features

### 👨🎓 User Experience
- **Interactive Speaking Practice**: Choose speaking topics by difficulty (`Beginner`, `Intermediate`, `Advanced`) and category (`Interview`, `Career`, `Debate`, `Casual`).
- **Live Microphone Waveform**: Real-time Web Audio API visualizer during practice.
- **AI Speech-to-Text**: Automatic transcription via local OpenAI Whisper.
- **Detailed Skill Scoring**: 0–100 score breakdown across **Grammar**, **Vocabulary**, **Fluency**, and **Pronunciation**.
- **Real-Time Spectrum Visualizer**: Dynamic audio playback visualizer.
- **Analytics & Progress Visualization**: Visual progression charts and date filters (`7d`, `30d`, `90d`, `All`).
- **Session History Management**: Practice history table with instant deletion and session re-play.

### 👨💼 Admin Management & Security
- **Command Center Overview**: Real-time statistics on total platform users, practice sessions, completion rate, and platform average score.
- **User Account Management**: Paginated user directory with active/deactivation toggling.
- **Session & AI Pipeline Monitoring**: Live tracking of AI status (`completed`, `processing`, `failed`) with safe **AI Retry** capabilities.
- **Audit Logging**: Full audit trail recording all administrative operations (`USER_STATUS_TOGGLE`, `TOPIC_CREATE`, `TOPIC_DELETE`, `SESSION_RETRY`).
- **Secure File Access**: Private streaming endpoints for uploaded user audio files with role verification.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Vanilla CSS Design Tokens, Web Audio API.
- **Backend API**: Node.js, Express.js, MongoDB (Mongoose ORM), JWT Authentication, Multer file uploads.
- **AI Microservice**: Python 3.10, FastAPI, OpenAI Whisper, LanguageTool NLP engine, Uvicorn server.
- **Containerization**: Docker, Docker Compose, NGINX reverse proxy.

---

## 🚀 Quick Start (Development & Local Run)

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017/speakora`
- **FFmpeg**: Installed or configured via python package

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
# Server listening on http://localhost:5000
```

### 3. Start Python FastAPI AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
# AI Service running on http://localhost:8000
```

### 4. Start React Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🐳 Production Deployment with Docker Compose

Deploy the entire stack (MongoDB, Backend, AI Microservice, and Frontend NGINX) using a single command:

```bash
docker-compose up --build -d
```

Access the application at `http://localhost`.

---

## 🔑 Default Credentials

| Portal | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Student Portal** | `aldan@example.com` | `password123` | User Dashboard |
| **Admin Portal** | `admin@speakora.com` | `Admin@123` | Admin Command Center |

---

## 💼 Placement & Technical Pitch

> "Speakora is a full-stack AI-powered English speaking analysis platform built using React, Node.js, Express.js, MongoDB and Python FastAPI. It uses Whisper for speech-to-text and an NLP pipeline to analyze grammar, vocabulary and fluency. Users can record speaking sessions, receive AI-generated feedback and track their progress through analytics, while administrators can monitor users, sessions, AI processing and platform performance."

use it live hosted demo :  https://aldan05.github.io/Speakora
