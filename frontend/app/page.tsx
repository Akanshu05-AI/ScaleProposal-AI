"use client";

import { useState } from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProposalForm from "@/components/proposal/ProposalForm";
import WorkflowTimeline from "@/components/workflow/WorkflowTimeline";
import ProposalViewer from "@/components/proposal/ProposalViewer";
import HistorySidebar, { ProposalHistoryItem } from "@/components/dashboard/HistorySidebar";

export default function Home() {
  const [proposal, setProposal] = useState("");
  const [plannerData, setPlannerData] = useState("");
  const [pricingData, setPricingData] = useState("");
  const [riskData, setRiskData] = useState("");
  const [, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ProposalHistoryItem[]>([]);

  const handleAddHistory = (newItem: { company: string; projectType: string; cost: string }) => {
    const historicalRecord: ProposalHistoryItem = {
      id: Date.now().toString(),
      company: newItem.company,
      projectType: newItem.projectType,
      date: "Just now",
      cost: newItem.cost,
      status: "verified"
    };
    setHistoryList((prev) => [historicalRecord, ...prev]);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8 selection:bg-blue-500/30 overflow-x-hidden relative">
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-[1600px] space-y-8 relative z-10">
        
        <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              ScaleProposal AI
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Multi-Agent Hybrid Infrastructure Architecture Suite
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Pipeline Online
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-3 min-h-[500px]">
            <HistorySidebar history={historyList} />
          </div>

          <div className="lg:col-span-4">
            <ProposalForm 
              setProposal={(content: any) => {
                if (typeof content === 'object' && content !== null) {
                  setProposal(content.proposal || "");
                  setPlannerData(content.planner_data || "");
                  setPricingData(content.pricing_data || "");
                  setRiskData(content.risk_data || "");
                } else {
                  setProposal(content);
                }
              }} 
              setLoading={setLoading} 
              onAddHistory={handleAddHistory} 
            />
          </div>

          <div className="lg:col-span-5">
            <WorkflowTimeline />
          </div>
        </div>

        <div className="pt-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Generated Blueprint Output Workspace
            </h3>
          </div>
          <ProposalViewer 
            proposal={proposal} 
            plannerData={plannerData}
            pricingData={pricingData}
            riskData={riskData}
          />
        </div>

      </div>
    </main>
  );
}