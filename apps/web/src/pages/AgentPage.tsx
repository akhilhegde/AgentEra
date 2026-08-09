import { useState } from "react";
import { Loader2, Zap, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PlanStep {
  skillId: string;
  skillName: string;
  description: string;
  price: string;
  order: number;
}

interface AgentResult {
  skill: string;
  skillName: string;
  success: boolean;
  result?: { content: string; format: string };
  payment?: { status: string; network: string; amount: string; currency: string };
  transactionId?: string;
  explorerUrl?: string;
  error?: string;
}

export function AgentPage() {
  const [query, setQuery] = useState("");
  const [planning, setPlanning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [plan, setPlan] = useState<{ steps: PlanStep[]; totalCost: string } | null>(null);
  const [results, setResults] = useState<AgentResult[] | null>(null);
  const [error, setError] = useState("");

  const handlePlan = async () => {
    if (!query.trim()) return;
    setPlanning(true);
    setError("");
    setPlan(null);
    setResults(null);
    try {
      const res = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) setPlan(data.plan);
      else setError(data.error || "Planning failed");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPlanning(false);
    }
  };

  const handleExecute = async () => {
    if (!plan) return;
    setExecuting(true);
    setError("");
    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) setResults(data.results);
      else setError(data.error || "Execution failed");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Agent Mode</span>
        </h1>
        <p className="text-slate-400 mb-8">
          Enter a complex request and AgentHub will orchestrate multiple AI skills with individual payments.
        </p>

        {/* Query Input */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">What do you need help with?</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "Prepare me for a Google software engineering interview"'
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#0f0f23] border border-[#2d2d5e] text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-y"
          />
          <button onClick={handlePlan} disabled={planning || !query.trim()} className="glow-btn w-full mt-4 flex items-center justify-center gap-2">
            {planning ? <><Loader2 className="w-5 h-5 animate-spin" /> Planning...</> : <><Zap className="w-5 h-5" /> Create Agent Plan</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Plan */}
        {plan && !results && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">📋 Agent Plan</h2>
            <div className="space-y-3 mb-6">
              {plan.steps.map((step) => (
                <div key={step.skillId} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f23] border border-[#2d2d5e]">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold mr-2">STEP {step.order}</span>
                    <span className="text-white font-medium">{step.skillName}</span>
                  </div>
                  <span className="text-indigo-300 font-bold">${step.price} USDC</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <span className="text-white font-bold">Total Cost</span>
              <span className="text-xl font-bold gradient-text">${plan.totalCost} USDC</span>
            </div>
            <button onClick={handleExecute} disabled={executing} className="glow-btn w-full flex items-center justify-center gap-2">
              {executing ? <><Loader2 className="w-5 h-5 animate-spin" /> Executing {plan.steps.length} skills...</> : <>Pay ${plan.totalCost} & Execute All</>}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">🎯 Results</h2>
            {results.map((r, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">{r.skillName}</h3>
                  {r.success ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-sm"><CheckCircle2 className="w-4 h-4" /> Settled</span>
                  ) : (
                    <span className="text-red-400 text-sm">Failed</span>
                  )}
                </div>
                {r.transactionId && (
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="text-slate-400">TX:</span>
                    <code className="text-indigo-300">{r.transactionId.slice(0, 16)}...</code>
                    {r.explorerUrl && (
                      <a href={r.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
                {r.result && (
                  <div className="markdown-output bg-[#0f0f23] rounded-xl p-4 max-h-96 overflow-y-auto">
                    <ReactMarkdown>{r.result.content}</ReactMarkdown>
                  </div>
                )}
                {r.error && <p className="text-red-400 text-sm">{r.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
