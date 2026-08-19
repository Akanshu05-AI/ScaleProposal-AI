"use client";

import { useState } from "react";
import { ProposalSummaryItem } from "../../types/proposal";
import { History, Search, Trash2, ChevronRight, Clock, Building2 } from "lucide-react";

interface HistorySidebarProps {
  history: ProposalSummaryItem[];
  onSelectProposal?: (id: string) => void;
  onDeleteProposal?: (id: string) => void;
  activeProposalId?: string | null;
}

export default function HistorySidebar({
  history = [],
  onSelectProposal,
  onDeleteProposal,
  activeProposalId,
}: HistorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(
    (item) =>
      item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl p-4 shadow-xl">
      {/* Sidebar Header */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Proposal History</h3>
        </div>
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-zinc-800">
          {history.length} Saved
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none"
        />
      </div>

      {/* Proposal List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            {searchTerm ? "No matching proposals" : "No proposals generated yet"}
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isSelected = activeProposalId === item.id || activeProposalId === item.workflow_id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectProposal && onSelectProposal(item.id)}
                className={`group relative flex cursor-pointer flex-col rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-blue-500/50 bg-blue-500/10 text-white"
                    : "border-zinc-800/60 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-100">
                    <Building2 size={13} className="text-zinc-400" />
                    <span className="truncate max-w-[140px]">{item.company_name}</span>
                  </div>

                  {onDeleteProposal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProposal(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-0.5"
                      title="Delete Proposal"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 mt-1 truncate">{item.project_type}</p>

                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/40 pt-2 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1 font-mono text-zinc-400">
                    <Clock size={10} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-amber-400/90">{item.cost || "Verified"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 2px; }
      `}</style>
    </div>
  );
}
export type { ProposalSummaryItem };