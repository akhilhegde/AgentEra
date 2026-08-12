// ===========================================
// Improvement Roadmap Tab Component
// ===========================================

import { AlertOctagon, AlertCircle, Info, PenTool, FileEdit, Rocket, Briefcase } from "lucide-react";

interface RoadmapItem {
  problem: string;
  why: string;
  fix: string;
}

interface RewriteSuggestions {
  betterSummary: string;
  betterProjectBullets: string[];
  betterExperienceBullets: string[];
}

interface ImprovementRoadmapProps {
  critical: RoadmapItem[];
  recommended: RoadmapItem[];
  niceToHave: RoadmapItem[];
  rewriteSuggestions: RewriteSuggestions;
}

function RoadmapSection({
  items,
  level,
  color,
  icon,
}: {
  items: RoadmapItem[];
  level: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rr-roadmap-section">
      <h4 className="rr-roadmap-level" style={{ color }}>
        <span className="rr-roadmap-badge" style={{ background: `${color}20`, borderColor: `${color}40`, color }}>
          {icon} {level}
        </span>
        <span className="rr-roadmap-count">{items.length} items</span>
      </h4>
      <div className="rr-roadmap-items">
        {items.map((item, i) => (
          <div key={i} className="rr-roadmap-item" style={{ borderLeftColor: color }}>
            <div className="rr-roadmap-problem">
              <strong>Problem:</strong> {item.problem}
            </div>
            <div className="rr-roadmap-why">
              <strong>Why it matters:</strong> {item.why}
            </div>
            <div className="rr-roadmap-fix">
              <strong>Fix:</strong> {item.fix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ImprovementRoadmap({
  critical,
  recommended,
  niceToHave,
  rewriteSuggestions,
}: ImprovementRoadmapProps) {
  return (
    <div className="rr-improvements">
      <RoadmapSection items={critical} level="Critical Fixes" color="#ef4444" icon={<AlertOctagon size={14} />} />
      <RoadmapSection items={recommended} level="Recommended Improvements" color="#fbbf24" icon={<AlertCircle size={14} />} />
      <RoadmapSection items={niceToHave} level="Nice To Have" color="#60a5fa" icon={<Info size={14} />} />

      {/* Rewrite Suggestions */}
      <div className="rr-rewrite-section">
        <h3 className="rr-rewrite-title">
          <span className="rr-card-icon"><PenTool size={18} /></span> Resume Rewrite Suggestions
        </h3>

        <div className="rr-analysis-card">
          <h4 className="rr-analysis-card-title">
            <span className="rr-card-icon"><FileEdit size={16} /></span> Better Summary
          </h4>
          <div className="rr-rewrite-block">{rewriteSuggestions.betterSummary}</div>
        </div>

        {rewriteSuggestions.betterProjectBullets.length > 0 && (
          <div className="rr-analysis-card">
            <h4 className="rr-analysis-card-title">
              <span className="rr-card-icon"><Rocket size={16} /></span> Better Project Descriptions
            </h4>
            <ul className="rr-rewrite-list">
              {rewriteSuggestions.betterProjectBullets.map((bullet, i) => (
                <li key={i} className="rr-rewrite-bullet">{bullet}</li>
              ))}
            </ul>
          </div>
        )}

        {rewriteSuggestions.betterExperienceBullets.length > 0 && (
          <div className="rr-analysis-card">
            <h4 className="rr-analysis-card-title">
              <span className="rr-card-icon"><Briefcase size={16} /></span> Better Experience Bullets
            </h4>
            <ul className="rr-rewrite-list">
              {rewriteSuggestions.betterExperienceBullets.map((bullet, i) => (
                <li key={i} className="rr-rewrite-bullet">{bullet}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
