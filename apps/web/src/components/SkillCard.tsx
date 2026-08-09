// ===========================================
// Skill Card Component
// ===========================================
import { Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Skill } from "../services/api";

export function SkillCard({ skill }: { skill: Skill }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{skill.icon}</span>
          <div>
            <h3 className="font-bold text-lg text-white">{skill.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
              {skill.category}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold gradient-text">${skill.price}</div>
          <div className="text-xs text-emerald-400 font-semibold">{skill.currency} / use</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed flex-1">
        {skill.description}
      </p>

      {/* Network & Input badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-black/30 p-2.5 rounded-lg border border-indigo-500/10">
        <span>Input: {skill.inputSchema.label || "Text prompt"}</span>
        <span className="text-indigo-300 font-medium">Algorand TestNet</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {skill.rating}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          {skill.usageCount.toLocaleString()} uses
        </span>
        <span className="text-slate-600">by {skill.provider}</span>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate(`/skill/${skill.id}`)}
        className="glow-btn w-full text-center mt-1 text-sm font-semibold"
      >
        Run Skill (${skill.price} USDC)
      </button>
    </div>
  );
}
