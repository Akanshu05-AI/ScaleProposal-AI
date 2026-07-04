"use client";

import { useState } from "react";
import { useWorkflow } from "../../context/WorkflowContext";
import { Sparkles, Send } from "lucide-react";

interface ProposalFormProps {
  setProposal: (content: any) => void;
  setLoading: (loading: boolean) => void;
  onAddHistory: (item: { company: string; projectType: string; cost: string }) => void;
}

export default function ProposalForm({ setProposal, setLoading, onAddHistory }: ProposalFormProps) {
  const { updateAgent, resetWorkflow } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Input tracking states
  const [companyName, setCompanyName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [requirements, setRequirements] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !projectType) return;

    setLoading(true);
    setIsSubmitting(true);
    
    // Clear out timeline markers and viewer cards for the incoming execution run
    resetWorkflow();
    setProposal(""); 

    try {
      // Visually engage the loading spinner on your planner node immediately
      updateAgent("planner", "running");

      const response = await fetch("http://localhost:8000/api/v1/proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: companyName,
          project_type: projectType,
          requirements: requirements,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status code: ${response.status}`);
      }

      const data = await response.json();

      // Ensure execution data exists inside response arrays
      if (data.status === "success" || data.proposal) {
        const workflowList = data.workflow || [];
        
        // 1. Loop through your logs and display actual python execution durations!
        workflowList.forEach((item: any) => {
          const agentKey = item.agent.toLowerCase().split(" ")[0]; // Maps "Planner Agent" -> "planner"
          updateAgent(agentKey, "completed", item.execution_time);
        });

        // 2. Reconstruct raw python dict states into readable markdown text for your workspace views
        const reqLen = requirements.length;
        
        // Emulate your PricingAgent conditional logic thresholds locally for ui clarity
        const pricingFallback = reqLen < 200 
          ? { timeline: "2 Weeks", budget: "$2,000", team_size: 2 }
          : reqLen < 500 
          ? { timeline: "1 Month", budget: "$5,000", team_size: 4 }
          : { timeline: "2 Months", budget: "$10,000", team_size: 6 };

        // Emulate your RiskAgent parsing strings condition arrays locally for ui clarity
        const reqLower = requirements.toLowerCase();
        const risksFallback: string[] = [];
        if (reqLower.includes("ai")) risksFallback.push("AI responses may occasionally be inaccurate.");
        if (reqLower.includes("login")) risksFallback.push("Authentication vulnerabilities.");
        if (reqLower.includes("payment")) risksFallback.push("Payment gateway integration risks.");
        if (risksFallback.length === 0) risksFallback.push("Standard project delivery risks.");

        const parsedPlanner = `### 🧠 Planner Agent Strategy\n\n**Client Target:** ${companyName}\n**Project Footprint:** ${projectType}\n\n#### 🛠️ Suggested Tech Stack Alignment\n* Next.js\n* FastAPI\n* Gemini AI\n* SQLite\n\n#### 📦 Targeted Project Deliverables\n* Requirement Analysis\n* System Design\n* Development\n* Testing\n* Deployment`;

        const parsedPricing = `### 💰 Financial Matrix Allocation\n\n* **Estimated Timeline Footprint:** ${pricingFallback.timeline}\n* **Calculated Project Budget:** ${pricingFallback.budget}\n* **Recommended Team Allocation Size:** ${pricingFallback.team_size} engineers`;

        const parsedRisk = `### ⚠️ Operational Risk Mitigation Analysis\n\nThe system engine flagged the following critical constraints within the specified execution scope:\n\n${risksFallback.map(r => `* **Flagged Vector:** ${r}`).join("\n")}`;

        // 3. Update the multi-tab workspace component with full dataset map objects
        setProposal({
          proposal: data.proposal || "",
          planner_data: parsedPlanner,
          pricing_data: parsedPricing,
          risk_data: parsedRisk,
        });

        // 4. Push record down to history stack panel
        onAddHistory({
          company: companyName,
          projectType: projectType,
          cost: pricingFallback.budget,
        });
      }

    } catch (error) {
      console.error("Failed to map live agent matrix data:", error);
      updateAgent("planner", "idle");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl p-6 shadow-xl">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles size={16} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Generate Proposal</h2>
          <p className="text-xs text-zinc-500">Input client configuration targets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Company Name</label>
          <input
            type="text"
            placeholder="e.g., Microsoft, Amazon, Google"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            required
          />
        </div>

        {/* Project Type Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Project Type</label>
          <input
            type="text"
            placeholder="e.g., Cloud Migration, Enterprise SaaS, AI Integration"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            required
          />
        </div>

        {/* Requirements / Scope Text Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Requirements / Scope</label>
          <textarea
            placeholder="Outline specific objectives, constraints, or feature targets..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            className="w-full p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
          />
        </div>

        {/* Submission Action Control Button */}
        <button
          type="submit"
          disabled={isSubmitting || !companyName || !projectType}
          className={`w-full group relative flex items-center justify-center gap-2 h-11 font-medium text-sm transition-all duration-300 rounded-xl ${
            isSubmitting 
              ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] active:scale-[0.98]"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              Orchestrating Agents...
            </span>
          ) : (
            <>
              <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Generate Proposal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}