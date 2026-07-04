"use client";

import { useEffect, useState } from "react";
import WorkflowCard from "./WorkflowCard";
import { useWorkflow } from "@/context/WorkflowContext";
import { CheckCircle2, Loader2, Clock } from "lucide-react";

export default function WorkflowTimeline() {
  const { agents } = useWorkflow();
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Match your precise workflow status constraints
  const isRunning = agents.some((a) => a.status === "running");
  const isCompleted = agents.length > 0 && agents.every((a) => a.status === "completed");

  // Global Pipeline Execution Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    return seconds.toFixed(1) + "s";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/20 p-6 backdrop-blur-xl shadow-2xl">
      
      {/* Ambient background glows */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />

      {/* Orchestrator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
              AI Orchestration Flow
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time multi-agent execution pipeline
          </p>
        </div>

        {/* Status Metrics Panel */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>ELAPSED:</span>
            <span className="text-zinc-200 font-bold min-w-[45px] text-right">
              {formatTime(totalSeconds)}
            </span>
          </div>

          {isRunning && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Finished
            </span>
          )}
        </div>
      </div>

      {/* Timeline List Stream */}
      <div className="relative pl-8 sm:pl-10 space-y-6">
        
        {/* Dynamic Connected Background Line */}
        <div className="absolute top-4 bottom-4 left-[15px] sm:left-[19px] w-[2px] bg-zinc-800/60 pointer-events-none" />

        {/* Glowing Active Dynamic Progression Line Line */}
        <div 
          className="absolute top-4 left-[15px] sm:left-[19px] w-[2px] bg-gradient-to-b from-emerald-500 via-violet-500 to-transparent transition-all duration-500 ease-out pointer-events-none"
          style={{
            height: isCompleted 
              ? 'calc(100% - 32px)' 
              : `${Math.max(10, (agents.findIndex(a => a.status === 'running') + 0.5) / agents.length * 100)}%`
          }}
        />

        {agents.map((agent) => {
          const isActive = agent.status === "running";
          const isDone = agent.status === "completed";

          return (
            <div key={agent.id} className="relative transition-all duration-300">
              
              {/* Timeline Node Bullet */}
              <div className="absolute -left-[33px] sm:-left-[37px] top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full">
                {isDone ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.2)] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                ) : isActive ? (
                  <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] text-violet-400">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/20 opacity-75" />
                    <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                )}
              </div>

              {/* Opacity States for Non-active Nodes */}
              <div className={`transition-all duration-300 ${
                isActive ? "opacity-100 scale-[1.005]" : isDone ? "opacity-85" : "opacity-40"
              }`}>
                <WorkflowCard agent={agent} />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}