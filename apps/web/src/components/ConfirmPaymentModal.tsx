import { X, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import type { Skill } from "../services/api";

interface ConfirmPaymentModalProps {
  skill: Skill;
  input: string;
  onClose: () => void;
  onConfirmPay: () => void;
}

export function ConfirmPaymentModal({
  skill,
  input,
  onClose,
  onConfirmPay,
}: ConfirmPaymentModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-lg w-full p-6 border border-indigo-500/30 rounded-2xl shadow-2xl relative bg-[#0f0f23]/95 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2d2d5e] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> x402 Protocol Active
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">x402 Payment Required</h3>
        <p className="text-xs text-slate-400 mb-5">
          Confirmation needed before on-chain USDC testnet deduction.
        </p>

        {/* Skill Details */}
        <div className="bg-[#1a1a3e] p-4 rounded-xl border border-[#2d2d5e] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{skill.icon}</span>
            <div>
              <h4 className="font-bold text-white text-sm">{skill.name}</h4>
              <p className="text-xs text-slate-400">{skill.category} Skill</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-indigo-400">${skill.price}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">{skill.currency} / run</div>
          </div>
        </div>

        {/* Payment Warning Notice */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 mb-5 flex items-start gap-3 text-xs text-indigo-200">
          <Wallet className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            By clicking <b>Confirm & Pay</b>, exactly <span className="text-emerald-400 font-bold">${skill.price} USDC</span> testnet currency will be deducted from your wallet and settled to the receiver on <b>Algorand TestNet</b>.
          </div>
        </div>

        {/* Input Summary */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Input Submission Preview
          </label>
          <div className="bg-[#090919] p-3 rounded-lg border border-[#2d2d5e] text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed">
            {input}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#2d2d5e] text-slate-300 hover:text-white text-sm font-semibold hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirmPay();
            }}
            className="glow-btn px-5 py-2.5 text-sm font-bold flex items-center gap-2"
          >
            Confirm & Pay ${skill.price} USDC <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
