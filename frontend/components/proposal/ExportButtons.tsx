"use client";

import { useState } from "react";
import { ProposalResponse } from "../../types/proposal";
import { Download, FileDown, Loader2 } from "lucide-react";

interface ExportButtonsProps {
  proposalResponse?: ProposalResponse | null;
}

export default function ExportButtons({ proposalResponse }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    if (!proposalResponse) return;

    setIsExporting(true);

    try {
      const markdownText = proposalResponse.final_markdown || proposalResponse.proposal?.markdown_content || "";
      const company = proposalResponse.company_name || "Client";
      const title = `Proposal_${company.replace(/[^a-zA-Z0-0]/g, "_")}`;

      // Open clean print window formatted professionally
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to export PDF.");
        setIsExporting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #111827;
                line-height: 1.6;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; font-size: 24px; }
              h2 { color: #1f2937; margin-top: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; font-size: 18px; }
              h3 { color: #374151; font-size: 15px; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
              th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: 600; }
              code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
              ul { padding-left: 20px; }
              li { margin-bottom: 4px; }
              .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="meta-box">
              <strong>ScaleProposal AI — Professional Business Proposal</strong><br/>
              Client: ${company} | Project: ${proposalResponse.project_type} | Date: ${new Date(proposalResponse.created_at || Date.now()).toLocaleDateString()}<br/>
              Status: Verified Production Proposal | Execution Time: ${proposalResponse.total_execution_time || "N/A"}
            </div>
            <div>
              ${formatMarkdownToHTML(markdownText)}
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={!proposalResponse || isExporting}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 text-xs font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      {isExporting ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FileDown size={14} />
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}

function formatMarkdownToHTML(markdown: string): string {
  if (!markdown) return "";
  let html = markdown
    .replace(/^# (.*$)/gim, "h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/\n\n/gim, "<br/>");
  return html;
}
