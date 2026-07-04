"use client";

import { useEffect } from "react";
import { useWorkflow } from "@/context/WorkflowContext";

export default function useWorkflowStream(enabled: boolean) {

    const { updateAgent } = useWorkflow();

    useEffect(() => {

        if (!enabled) return;

        const eventSource = new EventSource(
            "http://127.0.0.1:8000/api/v1/workflow/stream"
        );

        eventSource.onopen = () => {

            console.log("✅ Connected to Workflow Stream");

        };

        eventSource.onmessage = (event) => {

            const data = JSON.parse(event.data);

            console.log("Workflow Event:", data);

            updateAgent(
                data.agent,
                data.status,
                data.executionTime,
                data.error
            );

        };

        eventSource.onerror = () => {

            console.log("🔌 Workflow Stream Closed");

            eventSource.close();

        };

        return () => {

            eventSource.close();

        };

    }, [enabled, updateAgent]);

}