"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

import { WorkflowAgent, AgentStatus } from "@/types/workflow";

interface WorkflowContextType {

    agents: WorkflowAgent[];

    updateAgent: (
        id: string,
        status: AgentStatus,
        executionTime?: string,
        error?: string
    ) => void;

    resetWorkflow: () => void;

}

const defaultAgents: WorkflowAgent[] = [

    {
        id: "planner",
        title: "Planner Agent",
        icon: "🧠",
        task: "Understanding client requirements",
        status: "idle",
    },

    {
        id: "pricing",
        title: "Pricing Agent",
        icon: "💰",
        task: "Estimating budget",
        status: "idle",
    },

    {
        id: "risk",
        title: "Risk Agent",
        icon: "⚠️",
        task: "Risk Analysis",
        status: "idle",
    },

    {
        id: "proposal",
        title: "Proposal Agent",
        icon: "✍️",
        task: "Writing proposal",
        status: "idle",
    },

];

const WorkflowContext =
    createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [agents, setAgents] =
        useState<WorkflowAgent[]>(
            defaultAgents.map(agent => ({ ...agent }))
        );

    const updateAgent = (
        id: string,
        status: AgentStatus,
        executionTime?: string,
        error?: string
    ) => {

        setAgents(prev =>
            prev.map(agent => {

                if (agent.id !== id) {
                    return agent;
                }

                return {
                    ...agent,
                    status,
                    executionTime:
                        executionTime ?? agent.executionTime,
                    error,
                };

            })
        );

    };

    const resetWorkflow = () => {

        setAgents(

            defaultAgents.map(agent => ({
                ...agent,
                status: "idle",
                executionTime: undefined,
                error: undefined,
            }))

        );

    };

    return (

        <WorkflowContext.Provider
            value={{
                agents,
                updateAgent,
                resetWorkflow,
            }}
        >

            {children}

        </WorkflowContext.Provider>

    );

}

export function useWorkflow() {

    const context = useContext(WorkflowContext);

    if (!context) {

        throw new Error(
            "WorkflowProvider missing"
        );

    }

    return context;

}