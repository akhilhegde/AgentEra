// ===========================================
// Landing Page
// ===========================================
import { Link } from "react-router-dom";
import {
  Zap, Shield, Globe, ArrowRight, Cpu, CreditCard,
  CheckCircle2, Code, FileText, Brain, Rocket
} from "lucide-react";

const STEPS = [
  { icon: Globe, title: "Browse Skills", desc: "Discover AI-powered skills in our marketplace" },
  { icon: CreditCard, title: "Pay Per Use", desc: "Only pay for what you use — as low as $0.01" },
  { icon: Shield, title: "On-Chain Settlement", desc: "Every payment verified on Algorand Testnet" },
  { icon: CheckCircle2, title: "Get Results", desc: "Receive AI output + blockchain transaction proof" },
];

const FEATURED = [
  { icon: FileText, name: "Resume Reviewer", price: "0.01", cat: "Career" },
  { icon: Code, name: "Code Reviewer", price: "0.02", cat: "Coding" },
  { icon: Brain, name: "Text Summarizer", price: "0.01", cat: "Writing" },
  { icon: Rocket, name: "Startup Analyzer", price: "0.03", cat: "Business" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> Powered by Algorand x402 Protocol
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Don't pay for an AI.</span>
            <br />
            <span className="gradient-text">Pay only for the skill you use.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AgentHub is a marketplace where every AI skill is a micro-transaction.
            Real payments. Real blockchain settlement. Real transparency.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/marketplace" className="glow-btn flex items-center gap-2 text-lg px-8 py-4">
              Explore Marketplace <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-white/5 transition-all"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-[#2d2d5e]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            How <span className="gradient-text">AgentHub</span> Works
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">
            Four simple steps from discovery to verified payment
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="glass-card p-6 text-center group">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <div className="text-xs text-indigo-400 font-bold mb-2">STEP {i + 1}</div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular skills */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular <span className="gradient-text">Skills</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED.map((skill, i) => (
              <Link to="/marketplace" key={i} className="glass-card p-6 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <skill.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white mb-1">{skill.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{skill.cat}</p>
                <div className="text-lg font-bold gradient-text">${skill.price} USDC</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/marketplace" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 justify-center">
              View all skills <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why AgentHub */}
      <section className="py-20 px-4 border-t border-[#2d2d5e]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Why <span className="gradient-text">AgentHub</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "No Subscriptions", desc: "Pay per use, not per month. Use once or a thousand times." },
              { icon: Shield, title: "Verified Payments", desc: "Every transaction is settled on Algorand with a real TX ID." },
              { icon: Zap, title: "Instant Execution", desc: "x402 protocol handles payment automatically — no extra clicks." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <item.icon className="w-10 h-10 mx-auto text-indigo-400 mb-4" />
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d2d5e] py-8 px-4 text-center text-slate-500 text-sm">
        <p>AgentHub — Built for the Algorand x402 Hackathon</p>
        <p className="mt-1">Powered by Algorand Testnet • x402 Protocol • USDC</p>
      </footer>
    </div>
  );
}
