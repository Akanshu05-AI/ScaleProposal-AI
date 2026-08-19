"use client";

import { useState, useRef } from "react";
import { ProposalResponse } from "../../types/proposal";
import ExportButtons from "./ExportButtons";
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Brain,
  DollarSign,
  AlertTriangle,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";

interface ProposalViewerProps {
  proposalResponse?: ProposalResponse | null;
}

type ActiveTab = "planner" | "pricing" | "risk" | "proposal";

export default function ProposalViewer({ proposalResponse }: ProposalViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("proposal");
  const viewerRef = useRef<HTMLDivElement>(null);

  const planner = proposalResponse?.planner;
  const pricing = proposalResponse?.pricing;
  const risk = proposalResponse?.risk;
  const proposal = proposalResponse?.proposal;
  const markdownContent = proposalResponse?.final_markdown || proposal?.markdown_content || "";

  const handleCopy = async () => {
    let contentToCopy = "";
    if (activeTab === "proposal") {
      contentToCopy = markdownContent;
    } else if (activeTab === "planner" && planner) {
      contentToCopy = JSON.stringify(planner, null, 2);
    } else if (activeTab === "pricing" && pricing) {
      contentToCopy = JSON.stringify(pricing, null, 2);
    } else if (activeTab === "risk" && risk) {
      contentToCopy = JSON.stringify(risk, null, 2);
    }

    if (!contentToCopy) return;

    try {
      await navigator.clipboard.writeText(contentToCopy);
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
        isFullscreen ? "fixed inset-4 z-50 bg-zinc-950" : "min-h-[500px] max-h-[800px]"
      }`}
    >
      {/* Header Bar with Tabs and Controls */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 bg-zinc-950/80 p-4 gap-4 backdrop-blur-md rounded-t-2xl">
        <div className="flex flex-wrap gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/50">
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "planner"
                ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Brain size={14} className="text-pink-400" />
            <span>Planner Scope</span>
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "pricing"
                ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <DollarSign size={14} className="text-amber-400" />
            <span>Pricing Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "risk"
                ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <AlertTriangle size={14} className="text-orange-400" />
            <span>Risk Vectors</span>
          </button>
          <button
            onClick={() => setActiveTab("proposal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "proposal"
                ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Award size={14} className="text-emerald-400" />
            <span>Final Proposal</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            disabled={!proposalResponse}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>

          <ExportButtons proposalResponse={proposalResponse} />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {!proposalResponse ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/20">
            <FileText size={32} className="text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 font-medium">No proposal output generated yet.</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Fill in client specifications above and click &quot;Generate AI Proposal&quot; to orchestrate multi-agent analysis.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            {/* TAB 1: PLANNER SCOPE */}
            {activeTab === "planner" && planner && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                      <Brain size={18} className="text-pink-400" />
                      Planner Scope & Architecture Strategy
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{planner.project_summary}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    Complexity: {planner.complexity}
                  </span>
                </div>

                {/* Recommended Tech Stack Badges */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Recommended Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {planner.recommended_stack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-mono bg-zinc-900 text-zinc-200 border border-zinc-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Target Deliverables ({planner.deliverables.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {planner.deliverables.map((item, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-200">{item.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {item.phase}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Phases */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Implementation Roadmap Phases
                  </h4>
                  <div className="space-y-2">
                    {planner.phases.map((phase, i) => (
                      <div key={i} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs">
                          {phase.phase_number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-200">{phase.phase_name}</span>
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <Clock size={12} /> {phase.duration_weeks} weeks
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            {phase.key_activities.join(" • ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING MATRIX */}
            {activeTab === "pricing" && pricing && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                      <DollarSign size={18} className="text-amber-400" />
                      Financial & Effort Pricing Matrix
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{pricing.reasoning}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Timeline: {pricing.timeline}
                  </span>
                </div>

                {/* Metric Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase">Dev Cost</span>
                    <p className="text-lg font-bold text-zinc-100 mt-1">${pricing.development_cost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase">Infra & Cloud</span>
                    <p className="text-lg font-bold text-zinc-100 mt-1">${pricing.infrastructure_cost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase">Maintenance/Yr</span>
                    <p className="text-lg font-bold text-zinc-100 mt-1">${pricing.maintenance_cost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[11px] font-medium text-amber-400 uppercase">Total Estimate</span>
                    <p className="text-lg font-bold text-amber-300 mt-1">${pricing.estimated_total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Team Composition & Hours */}
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Recommended Engineering Team ({pricing.effort_hours} Hours)
                    </h4>
                    <span className="text-xs text-zinc-400">Range: {pricing.pricing_range}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pricing.team_allocation.map((role, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-200 border border-zinc-700/50">
                        👨‍💻 {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RISK VECTORS */}
            {activeTab === "risk" && risk && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-orange-400" />
                      Risk Assessment & Engineering Mitigations
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{risk.summary}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    Overall Risk: {risk.overall_risk_level}
                  </span>
                </div>

                <div className="space-y-3">
                  {risk.risks.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-orange-400" />
                          {item.risk}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {item.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.severity === 'High' || item.severity === 'Critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {item.severity} Severity
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400">
                        <strong className="text-zinc-300">Impact:</strong> {item.impact}
                      </p>
                      <p className="text-xs text-emerald-400/90 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        <strong>Mitigation Strategy:</strong> {item.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FINAL PROPOSAL MARKDOWN */}
            {activeTab === "proposal" && (
              <div className="animate-fadeIn">
                <article className="prose prose-invert max-w-none text-zinc-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {markdownContent}
                </article>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}