from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import asyncio
import json

from app.services.event_manager import event_manager

router = APIRouter()


async def event_generator(request: Request):
    """
    Streams workflow events to the frontend using
    Server-Sent Events (SSE).
    """

    while True:

        # Stop if client disconnects
        if await request.is_disconnected():
            print("🔌 Workflow stream disconnected")
            break

        try:
            event = await event_manager.subscribe()

            yield f"data: {json.dumps(event)}\n\n"

        except asyncio.CancelledError:
            print("❌ SSE Cancelled")
            break

        except Exception as e:
            print(f"❌ SSE Error: {e}")
            break


@router.get("/workflow/stream", tags=["Workflow"])
async def workflow_stream(request: Request):

    return StreamingResponse(
        event_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Better compatibility behind proxies
        },
    )