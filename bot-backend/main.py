# main.py - FastAPI backend for ChatterLite AI chat app
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from transformers import pipeline, Pipeline
from typing import Optional
import logging
import asyncio
from dotenv import load_dotenv
from routes.chatWithMe import router as chatwithme_router

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="ChatterLite AI Chat Backend",
    description="AI-powered chat backend with Jitsi integration",
    version="1.0.0"
)

# CORS - Lock down origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Replace with your frontend URL in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure structured logging with timestamp
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("chatterlite-backend")

# Include the chatWithMe router
app.include_router(chatwithme_router)

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns status of the AI model.
    """
    return {"status": "ok"}

@app.post("/chatbot", tags=["Chatbot"])
async def chatbot_endpoint(request: Request):
    """
    AI chatbot endpoint.
    Accepts JSON payload with 'message' key.
    Returns AI generated reply.
    """
    return {"reply": "Bot is currently disabled."}

@app.get("/jitsi", response_class=HTMLResponse, tags=["Video Call"])
async def jitsi_meet_embed():
    """
    Serves an HTML page embedding a Jitsi Meet room for video calling.
    """
    html_content = '''
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ChatterLite Video Call</title>
        <style>
          html, body, iframe {
            margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden;
          }
        </style>
      </head>
      <body>
        <iframe
          src="https://meet.jit.si/ChatterLiteTestRoom"
          allow="camera; microphone; fullscreen; display-capture"
          title="Video room"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </body>
    </html>
    '''
    return HTMLResponse(content=html_content)

