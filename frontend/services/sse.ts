import { WorkflowEvent } from "../types/workflow";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class WorkflowStreamService {
  /**
   * Subscribe to real-time Server-Sent Events (SSE) for a specific workflow_id.
   */
  static subscribe(
    workflowId: string,
    onEvent: (event: WorkflowEvent) => void,
    onError?: (error: any) => void
  ): () => void {
    const streamUrl = `${API_BASE_URL}/workflows/${workflowId}/stream`;
    console.log(`🔌 Opening SSE stream connection to ${streamUrl}`);

    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (messageEvent) => {
      try {
        const eventData: WorkflowEvent = JSON.parse(messageEvent.data);
        console.log("📥 SSE Event Received:", eventData);
        onEvent(eventData);

        if (eventData.agent === "workflow" && (eventData.status === "finished" || eventData.status === "failed")) {
          console.log(`🏁 Stream reached terminal status '${eventData.status}'. Closing connection.`);
          eventSource.close();
        }
      } catch (e) {
        console.error("Failed to parse SSE event data:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("⚠️ SSE Stream connection error:", err);
      if (onError) {
        onError(err);
      }
      eventSource.close();
    };

    // Return cleanup function to close connection
    return () => {
      console.log(`🔌 Closing SSE stream connection for workflow ${workflowId}`);
      eventSource.close();
    };
  }
}
