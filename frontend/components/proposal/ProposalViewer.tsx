"use client";

import { useState, useRef } from "react";
import { 
  Copy, 
  Check, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Brain,
  DollarSign,
  AlertTriangle,
  Award
} from "lucide-react";

interface ProposalViewerProps {
  proposal?: string;
  plannerData?: string;
  pricingData?: string;
  riskData?: string;
}

type ActiveTab = "planner" | "pricing" | "risk" | "proposal";

export default function ProposalViewer({ 
  proposal = "",
  plannerData = "",
  pricingData = "",
  riskData = ""
}: ProposalViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("proposal");
  const viewerRef = useRef<HTMLDivElement>(null);

  const getActiveContent = () => {
    switch (activeTab) {
      case "planner": return plannerData || "No distinct planner specifications generated for this asset view.";
      case "pricing": return pricingData || "No financial matrices formatted for this asset view.";
      case "risk": return riskData || "No critical risk alignments tracked for this asset view.";
      default: return proposal;
    }
  };

  const currentContent = getActiveContent();

  const handleCopy = async () => {
    if (!currentContent) return;
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy content: ", err);
    }
  };

  return (
    <div 
      ref={viewerRef}
      className={`flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl transition-all duration-300 shadow-2xl ${
        isFullscreen ? "fixed inset-4 z-50 bg-zinc-950" : "min-h-[450px] max-h-[750px]"
      }`}
    >
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 bg-zinc-950/80 p-4 gap-4 backdrop-blur-md rounded-t-2xl">
        <div className="flex flex-wrap gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/40">
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "planner" ? "bg-zinc-800 text-white border border-zinc-700/50 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Brain size={13} className="text-pink-400" />
            <span>Planner Scope</span>
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "pricing" ? "bg-zinc-800 text-white border border-zinc-700/50 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <DollarSign size={13} className="text-amber-400" />
            <span>Pricing Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "risk" ? "bg-zinc-800 text-white border border-zinc-700/50 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <AlertTriangle size={13} className="text-orange-400" />
            <span>Risk Vectors</span>
          </button>
          <button
            onClick={() => setActiveTab("proposal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "proposal" ? "bg-zinc-800 text-white border border-zinc-700/50 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Award size={13} className="text-emerald-400" />
            <span>Final Proposal</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            disabled={!currentContent}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Content</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            disabled={!proposal}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
        {proposal ? (
          <article className="mx-auto max-w-3xl text-zinc-300 whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed selection:bg-violet-500/30 animate-fadeIn">
            {currentContent}
          </article>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
            <p className="text-sm text-zinc-500 font-medium">No active runtime generated yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Submit configuration parameters above to query orchestrator keys.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
}