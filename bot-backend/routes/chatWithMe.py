from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/api/chatwithme")
async def chatwithme_endpoint(request: Request):
    data = await request.json()
    message = data.get("message", "")
    if not message:
        return JSONResponse({"error": "No message provided"}, status_code=400)
    # Simulate improvement (replace with real AI logic if needed)
    improved_prompt = f"Improved prompt: {message}"
    return {"reply": improved_prompt}
