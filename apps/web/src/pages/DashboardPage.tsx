import { ExternalLink, Receipt, TrendingUp } from "lucide-react";
import { usePaymentStore } from "../stores/payment.store";

export function DashboardPage() {
  const history = usePaymentStore((s) => s.history);
  const totalSpent = history.filter((h) => h.status === "settled").reduce((sum, h) => sum + parseFloat(h.amount), 0);

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My <span className="gradient-text">Usage</span></h1>
        <p className="text-slate-400 mb-8">Your payment history and skill usage</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5"><div className="text-sm text-slate-400 mb-1">Total Spent</div><div className="text-2xl font-bold gradient-text">${totalSpent.toFixed(4)} USDC</div></div>
          <div className="glass-card p-5"><div className="text-sm text-slate-400 mb-1">Skills Used</div><div className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> {history.length}</div></div>
          <div className="glass-card p-5"><div className="text-sm text-slate-400 mb-1">Network</div><div className="text-2xl font-bold text-white">Algorand Testnet</div></div>
        </div>
        {history.length === 0 ? (
          <div className="glass-card p-12 text-center"><Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No payments yet. Try a skill from the marketplace!</p></div>
        ) : (
          <div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-[#2d2d5e]"><th className="text-left px-6 py-4 text-slate-400 font-medium">Skill</th><th className="text-left px-6 py-4 text-slate-400 font-medium">Amount</th><th className="text-left px-6 py-4 text-slate-400 font-medium">Status</th><th className="text-left px-6 py-4 text-slate-400 font-medium">Transaction</th><th className="text-left px-6 py-4 text-slate-400 font-medium">Date</th></tr></thead>
            <tbody>{history.map((r) => (<tr key={r.id} className="border-b border-[#2d2d5e]/50"><td className="px-6 py-4 text-white font-medium">{r.skillName}</td><td className="px-6 py-4 text-indigo-300">{r.amount} {r.currency}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==="settled"?"bg-emerald-500/20 text-emerald-300":"bg-amber-500/20 text-amber-300"}`}>{r.status}</span></td><td className="px-6 py-4">{r.transactionId?<a href={r.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">{r.transactionId.slice(0,10)}...<ExternalLink className="w-3 h-3" /></a>:<span className="text-slate-500">—</span>}</td><td className="px-6 py-4 text-slate-400">{new Date(r.timestamp).toLocaleString()}</td></tr>))}</tbody>
          </table></div></div>
        )}
      </div>
    </div>
  );
}
