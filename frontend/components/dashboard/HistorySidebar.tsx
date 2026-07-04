"use client";

import { useState } from "react";
import { FolderOpen, Search, Clock, ShieldCheck, ExternalLink, Sparkles } from "lucide-react";

export interface ProposalHistoryItem {
  id: string;
  company: string;
  projectType: string;
  date: string;
  cost: string;
  status: "verified" | "draft";
}

interface HistorySidebarProps {
  history: ProposalHistoryItem[];
}

export default function HistorySidebar({ history }: HistorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState("");

  const activeItemId = activeId || (history.length > 0 ? history[0].id : "");

  const filteredHistory = history.filter(
    (item) =>
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
      <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-blue-500/5 blur-[50px] pointer-events-none" />

      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            <FolderOpen size={14} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">
            Proposal Vault
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
          HISTORY ({history.length})
        </span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
        <input
          type="text"
          placeholder="Filter runs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 focus:bg-zinc-900 transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-history-scrollbar">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => {
            const isActive = item.id === activeItemId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1.5 transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-zinc-900 to-zinc-900/60 border-zinc-700/80 shadow-md shadow-black/20 animate-fadeIn"
                    : "bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-zinc-800/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center border transition-all shrink-0 ${
                      isActive ? "bg-blue-600 border-blue-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}>
                      {item.company.charAt(0)}
                    </div>
                    <span className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                      {item.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <Clock size={10} />
                    <span>{item.date}</span>
                  </div>
                </div>

                <p className={`text-[11px] truncate ${isActive ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                  {item.projectType}
                </p>

                <div className="mt-0.5 flex items-center justify-between text-[10px] font-mono">
                  <span className={isActive ? "text-blue-400 font-bold" : "text-zinc-600 font-medium"}>
                    {item.cost}
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-500/80 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    <ShieldCheck size={10} />
                    <span>SECURE</span>
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800/60 rounded-xl bg-zinc-900/10">
            <p className="text-xs text-zinc-500 font-medium">Vault is currently empty</p>
            <p className="text-[10px] text-zinc-600 mt-1 max-w-[150px] mx-auto">Generated items populate dynamically.</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1 font-medium text-zinc-600">
          <Sparkles size={11} className="text-violet-500" />
          Vault Sync Active
        </span>
        <button className="hover:text-zinc-300 transition-colors flex items-center gap-0.5">
          <span>Logs</span>
          <ExternalLink size={10} />
        </button>
      </div>

      <style jsx global>{`
        .custom-history-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-history-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-history-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}