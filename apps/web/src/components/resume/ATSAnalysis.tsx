// ===========================================
// ATS Analysis Tab Component
// ===========================================

import { AlertTriangle, ClipboardX, Key } from "lucide-react";

interface ATSAnalysisData {
  score: number;
  compatibilityRating: string;
  parsingIssues: string[];
  missingSections: string[];
  keywordOptimization: string;
}

interface ATSAnalysisProps {
  data: ATSAnalysisData;
}

function getRatingColor(rating: string) {
  switch (rating) {
    case "Excellent": return "#34d399";
    case "Good": return "#60a5fa";
    case "Fair": return "#fbbf24";
    case "Poor": return "#ef4444";
    default: return "#94a3b8";
  }
}

export default function ATSAnalysis({ data }: ATSAnalysisProps) {
  const ratingColor = getRatingColor(data.compatibilityRating);

  return (
    <div className="rr-ats">
      {/* ATS Score Header */}
      <div className="rr-ats-score-header">
        <div className="rr-ats-score-circle">
          <span className="rr-ats-score-value">{data.score}</span>
          <span className="rr-ats-score-label">ATS Score</span>
        </div>
        <div className="rr-ats-rating" style={{ borderColor: `${ratingColor}40`, background: `${ratingColor}10` }}>
          <span className="rr-ats-rating-dot" style={{ background: ratingColor }} />
          <span style={{ color: ratingColor }}>{data.compatibilityRating}</span>
        </div>
      </div>

      {/* Parsing Issues */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><AlertTriangle size={16} /></span> Parsing Issues
        </h4>
        {data.parsingIssues.length > 0 ? (
          <ul className="rr-issue-list">
            {data.parsingIssues.map((issue, i) => (
              <li key={i} className="rr-issue-item rr-issue-warning">
                <span className="rr-issue-bullet">●</span>
                {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rr-no-issues">No parsing issues detected ✓</p>
        )}
      </div>

      {/* Missing Sections */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><ClipboardX size={16} /></span> Missing Sections
        </h4>
        {data.missingSections.length > 0 ? (
          <ul className="rr-issue-list">
            {data.missingSections.map((section, i) => (
              <li key={i} className="rr-issue-item rr-issue-critical">
                <span className="rr-issue-bullet">✕</span>
                {section}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rr-no-issues">All essential sections present ✓</p>
        )}
      </div>

      {/* Keyword Optimization */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><Key size={16} /></span> Keyword Optimization
        </h4>
        <p className="rr-analysis-text">{data.keywordOptimization}</p>
      </div>
    </div>
  );
}
