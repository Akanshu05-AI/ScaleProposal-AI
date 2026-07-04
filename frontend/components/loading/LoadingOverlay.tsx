"use client";

import { Loader2 } from "lucide-react";
import { useWorkflow } from "@/context/WorkflowContext";

interface Props {
    open: boolean;
}

export default function LoadingOverlay({
    open,
}: Props) {

    const { agents } = useWorkflow();

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">

            <div className="w-[700px] rounded-3xl border border-zinc-800 bg-zinc-900 p-10 shadow-2xl">

                <div className="mb-10 text-center">

                    <h1 className="text-4xl font-bold text-white">

                        🤖 ScaleProposal AI

                    </h1>

                    <p className="mt-3 text-zinc-400">

                        Generating your proposal...

                    </p>

                </div>

                <div className="space-y-6">

                    {agents.map((agent) => (

                        <div key={agent.id}>

                            <div className="mb-2 flex items-center justify-between">

                                <span className="font-medium text-white">

                                    {agent.icon} {agent.title}

                                </span>

                                <span className="text-sm text-zinc-400">

                                    {agent.status}

                                </span>

                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">

                                <div
                                    className={`h-full transition-all duration-700

                                    ${
                                        agent.status === "idle"
                                            ? "w-0"

                                            : agent.status === "running"
                                            ? "w-2/3 bg-yellow-500"

                                            : "w-full bg-green-500"
                                    }

                                    `}
                                />

                            </div>

                        </div>

                    ))}

                </div>

                <div className="mt-10 flex items-center justify-center gap-3 text-zinc-300">

                    <Loader2
                        className="animate-spin"
                        size={24}
                    />

                    AI Agents are collaborating...

                </div>

            </div>

        </div>

    );

}