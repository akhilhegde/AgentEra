import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";

const DEMO_STEPS = [
  "1. Browse the Marketplace — discover AI skills",
  "2. Select a skill — e.g. Resume Reviewer",
  "3. Enter your input — paste resume text",
  "4. Click 'Pay & Execute' — triggers x402 flow",
  "5. HTTP 402 → Client signs payment → Retry with proof",
  "6. Facilitator verifies & settles on Algorand",
  "7. AI skill executes after payment confirmed",
  "8. Response includes real Algorand Transaction ID",
  "9. View transaction on Algorand Explorer",
];

export function DemoPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen pt-20 px-4 pb-12"><div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">🎬 <span className="gradient-text">Hackathon Demo</span></h1>
      <p className="text-slate-400 mb-8">5-minute walkthrough of the AgentHub x402 payment flow</p>

      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Play className="w-5 h-5 text-indigo-400" /> Demo Steps</h2>
        <div className="space-y-3">
          {DEMO_STEPS.map((s, i) => (
            <div key={i} onClick={() => setStep(i)} className={`p-3 rounded-lg cursor-pointer transition-all ${i === step ? "bg-indigo-500/20 border border-indigo-500/30 text-white" : i < step ? "text-emerald-400 line-through opacity-60" : "text-slate-400 hover:bg-white/5"}`}>{s}</div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-30">← Previous</button>
          <button onClick={() => setStep(Math.min(DEMO_STEPS.length - 1, step + 1))} disabled={step === DEMO_STEPS.length - 1} className="glow-btn">Next →</button>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/marketplace" className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 flex items-center justify-between">Marketplace <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/skill/resume-reviewer" className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 flex items-center justify-between">Try Resume Reviewer <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/skill/code-reviewer" className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 flex items-center justify-between">Try Code Reviewer <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/dashboard" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 flex items-center justify-between">Payment History <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-3">x402 Payment Flow</h2>
        <pre className="text-sm text-slate-400 overflow-x-auto font-mono leading-relaxed">{`Client → POST /api/skills/resume-review
       ← 402 Payment Required (PAYMENT-REQUIRED header)
       → Signs USDC payment on Algorand Testnet
       → Retries with PAYMENT-SIGNATURE header
Server → Sends to Facilitator /verify
       ← Verification OK
       → Sends to Facilitator /settle
       ← Settlement confirmed (txId)
       → Executes AI skill
       ← 200 OK + PAYMENT-RESPONSE header
Client ← Receives AI result + real Transaction ID`}</pre>
      </div>
    </div></div>
  );
}
