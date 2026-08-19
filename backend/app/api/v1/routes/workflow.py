import json
import asyncio
from typing import Optional
from fastapi import APIRouter, Request, Query
from fastapi.responses import StreamingResponse

from app.services.event_manager import event_manager
from app.core.logging import logger

router = APIRouter()


async def workflow_event_generator(request: Request, workflow_id: str):
    """
    Streams workflow events to the frontend using Server-Sent Events (SSE),
    isolated per workflow_id.
    """
    logger.info(f"🔌 SSE Stream client connected for workflow_id: {workflow_id}")
    
    try:
        while True:
            # Stop if client disconnects
            if await request.is_disconnected():
                logger.info(f"🔌 SSE Stream client disconnected for workflow_id: {workflow_id}")
                break

            event = await event_manager.subscribe(workflow_id=workflow_id, timeout=15.0)

            if event:
                yield f"data: {json.dumps(event)}\n\n"
                
                # Close stream if workflow reached terminal state
                if event.get("agent") == "workflow" and event.get("status") in ["finished", "failed"]:
                    logger.info(f"🏁 Workflow {workflow_id} reached terminal status '{event.get('status')}'. Closing stream.")
                    break

            await asyncio.sleep(0.1)

    except asyncio.CancelledError:
        logger.info(f"❌ SSE Stream cancelled for workflow_id: {workflow_id}")
    except Exception as e:
        logger.error(f"❌ SSE Stream error for workflow_id {workflow_id}: {e}")
    finally:
        await event_manager.cleanup(workflow_id)


@router.get(
    "/workflows/{workflow_id}/stream",
    summary="Subscribe to isolated real-time workflow progress stream",
    tags=["Workflow"]
)
async def stream_workflow_by_id(workflow_id: str, request: Request):
    """
    SSE Endpoint isolated per workflow_id.
    Streams progress updates from Planner, Pricing, Risk, and Proposal agents.
    """
    return StreamingResponse(
        workflow_event_generator(request, workflow_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/workflow/stream",
    summary="Backward-compatible workflow stream endpoint",
    tags=["Workflow"]
)
async def stream_workflow_query(request: Request, workflow_id: Optional[str] = Query("default")):
    """
    Backward-compatible SSE endpoint accepting workflow_id as a query parameter.
    """
    return StreamingResponse(
        workflow_event_generator(request, workflow_id or "default"),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )