import asyncio
from typing import Any, Dict


class EventManager:
    """
    Simple in-memory event manager used for Server-Sent Events (SSE).

    Workflow:

    Planner Agent
          ↓
    Pricing Agent
          ↓
    Risk Agent
          ↓
    Proposal Agent
          ↓
    Event Queue
          ↓
    Frontend (SSE)
    """

    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()

    async def publish(self, event: Dict[str, Any]) -> None:
        """
        Publish an event into the queue.
        """

        print(f"📤 EVENT -> {event}")

        await self.queue.put(event)

    async def subscribe(self) -> Dict[str, Any]:
        """
        Wait until a new event is available.
        """

        event = await self.queue.get()

        print(f"📥 EVENT -> {event}")

        return event

    def size(self) -> int:
        """
        Current queue size.
        """

        return self.queue.qsize()

    async def clear(self):
        """
        Empty the queue.
        """

        while not self.queue.empty():
            self.queue.get_nowait()
            self.queue.task_done()


# Singleton instance
event_manager = EventManager()