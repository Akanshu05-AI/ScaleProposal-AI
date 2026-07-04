"use client";

import { FileText, Users, Clock, Sparkles } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export default function StatsCard({ title, value, subtitle }: StatsCardProps) {
  // Map specific metadata icons and style themes dynamically by card title
  const getCardMetadata = () => {
    switch (title.toLowerCase()) {
      case "proposals generated":
        return { icon: <FileText size={16} />, theme: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10" };
      case "ai agents":
        return { icon: <Users size={16} />, theme: "text-violet-400 bg-violet-500/10 border-violet-500/10" };
      case "average time":
        return { icon: <Clock size={16} />, theme: "text-amber-400 bg-amber-500/10 border-amber-500/10" };
      default:
        return { icon: <Sparkles size={16} />, theme: "text-cyan-400 bg-cyan-500/10 border-cyan-500/10" };
    }
  };

  const meta = getCardMetadata();

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-400 tracking-wide">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${meta.theme}`}>
          {meta.icon}
        </div>
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </h1>
      </div>

      <div className="mt-2 text-[11px] text-zinc-500 font-medium tracking-wide">
        {subtitle}
      </div>
    </div>
  );
}