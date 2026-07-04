"use client";

import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { WorkflowAgent } from "@/types/workflow";

interface Props {

    agent: WorkflowAgent;

}

export default function WorkflowCard({

    agent,

}: Props) {

    return (

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

            <div className="flex items-center justify-between">

                <div>

                    <h3 className="text-lg font-semibold text-white">

                        {agent.icon} {agent.title}

                    </h3>

                    <p className="text-sm text-zinc-400">

                        {agent.task}

                    </p>

                </div>

                {

                    agent.status === "idle" && (

                        <Circle
                            className="text-zinc-500"
                            size={22}
                        />

                    )

                }

                {

                    agent.status === "running" && (

                        <Loader2
                            className="animate-spin text-yellow-400"
                            size={22}
                        />

                    )

                }

                {

                    agent.status === "completed" && (

                        <CheckCircle2
                            className="text-green-500"
                            size={22}
                        />

                    )

                }

            </div>

            {

                agent.executionTime && (

                    <p className="mt-3 text-sm text-green-400">

                        {agent.executionTime}

                    </p>

                )

            }

        </div>

    );

}