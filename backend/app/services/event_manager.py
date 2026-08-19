import asyncio
from typing import Any, Dict, Optional
from app.core.logging import logger


class WorkflowEventManager:
    """
    Session-Isolated Server-Sent Events (SSE) Event Manager.

    Guarantees that each workflow request maintains its own isolated event queue
    indexed by `workflow_id`. Prevents cross-talk and race conditions between concurrent users.
    """

    def __init__(self):
        self._channels: Dict[str, asyncio.Queue] = {}
        self._lock = asyncio.Lock()

    async def get_queue(self, workflow_id: str) -> asyncio.Queue:
        """Get or create an isolated queue for a given workflow_id."""
        async with self._lock:
            if workflow_id not in self._channels:
                self._channels[workflow_id] = asyncio.Queue()
                logger.info(f"Created isolated SSE event channel for workflow_id: {workflow_id}")
            return self._channels[workflow_id]

    async def publish(self, workflow_id: str, event: Dict[str, Any]) -> None:
        """Publish an event to a specific workflow channel."""
        queue = await self.get_queue(workflow_id)
        event["workflow_id"] = workflow_id
        logger.info(f"📤 [Workflow {workflow_id}] Event -> agent: {event.get('agent')}, status: {event.get('status')}")
        await queue.put(event)

    async def subscribe(self, workflow_id: str, timeout: float = 30.0) -> Optional[Dict[str, Any]]:
        """Wait and retrieve the next event for a specific workflow channel."""
        queue = await self.get_queue(workflow_id)
        try:
            event = await asyncio.wait_for(queue.get(), timeout=timeout)
            queue.task_done()
            return event
        except asyncio.TimeoutError:
            return {"type": "ping", "workflow_id": workflow_id}

    async def cleanup(self, workflow_id: str) -> None:
        """Clean up and delete an isolated event queue when workflow completes or disconnects."""
        async with self._lock:
            if workflow_id in self._channels:
                del self._channels[workflow_id]
                logger.info(f"Cleaned up SSE channel for workflow_id: {workflow_id}")


# Singleton instance
event_manager = WorkflowEventManager()