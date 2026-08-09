// ===========================================
// Transaction Receipt Component
// ===========================================
import { CheckCircle2, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { SkillExecutionResponse } from "../services/api";

export function TransactionReceipt({ data }: { data: SkillExecutionResponse }) {
  const [copied, setCopied] = useState(false);

  const copyTxId = () => {
    navigator.clipboard.writeText(data.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data.transactionId) return null;

  return (
    <div className="glass-card p-6 pulse-success">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-300">Payment Settled ✓</h3>
            <p className="text-xs text-emerald-400/80">x402 On-Chain Transaction Confirmed</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Status: Settled
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Skill Executed</span>
          <span className="text-white font-medium capitalize">{data.skill}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Amount Paid</span>
          <span className="text-emerald-400 font-bold">
            {data.payment.amount} {data.payment.currency}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Network</span>
          <span className="text-indigo-300 font-medium">Algorand TestNet</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Transaction ID</span>
          <div className="flex items-center gap-2">
            <code className="text-indigo-200 text-xs bg-black/40 px-2 py-1 rounded border border-indigo-500/20">
              {data.transactionId.slice(0, 10)}...{data.transactionId.slice(-8)}
            </code>
            <button
              onClick={copyTxId}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Copy Transaction ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {data.explorerUrl && (
        <a
          href={data.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glow-btn w-full text-center flex items-center justify-center gap-2 mt-5 py-2.5 text-sm font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          View Transaction on Algorand Explorer
        </a>
      )}
    </div>
  );
}
