import { Code2, PlusCircle } from "lucide-react";
import { useState } from "react";

export function DevelopersPage() {
  const [form, setForm] = useState({ name: "", description: "", category: "Coding", price: "0.01", endpoint: "", providerWallet: "", providerName: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  if (submitted) return (
    <div className="min-h-screen pt-20 px-4 pb-12"><div className="max-w-2xl mx-auto text-center glass-card p-12">
      <PlusCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Skill Registered!</h2>
      <p className="text-slate-400">Your skill metadata has been submitted. In the MVP, custom skill execution uses controlled backend routes.</p>
      <button onClick={() => setSubmitted(false)} className="glow-btn mt-6">Register Another</button>
    </div></div>
  );

  return (
    <div className="min-h-screen pt-20 px-4 pb-12"><div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2"><span className="gradient-text">Developer</span> Portal</h1>
      <p className="text-slate-400 mb-8">Publish your AI skill on AgentHub and earn USDC per use</p>
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-3 mb-4"><Code2 className="w-6 h-6 text-indigo-400" /><h2 className="text-xl font-bold text-white">How It Works</h2></div>
        <ol className="text-slate-400 text-sm space-y-2 list-decimal list-inside">
          <li>Register your skill metadata below</li>
          <li>Your skill gets listed on the marketplace</li>
          <li>Users pay per use via x402 protocol</li>
          <li>Payments settle directly to your Algorand wallet</li>
        </ol>
      </div>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-white mb-2">Register a Skill</h2>
        {[
          { key: "name", label: "Skill Name", ph: "e.g. Grammar Fixer" },
          { key: "description", label: "Description", ph: "What does this skill do?" },
          { key: "price", label: "Price (USDC)", ph: "0.01" },
          { key: "providerName", label: "Provider Name", ph: "Your name or org" },
          { key: "providerWallet", label: "Algorand Wallet Address", ph: "Your receiver address" },
        ].map(({ key, label, ph }) => (
          <div key={key}><label className="block text-sm text-slate-300 mb-1">{label}</label>
            <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph} required className="w-full px-4 py-3 rounded-xl bg-[#0f0f23] border border-[#2d2d5e] text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none" /></div>
        ))}
        <div><label className="block text-sm text-slate-300 mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0f0f23] border border-[#2d2d5e] text-white focus:border-indigo-500 focus:outline-none">
            {["Coding","Career","Writing","Research","Business","Design","Education"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className="glow-btn w-full mt-2">Register Skill</button>
      </form>
    </div></div>
  );
}
