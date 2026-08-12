// ===========================================
// Recruiter Review Tab Component
// ===========================================

import { Eye, Flag, Sparkles, Laptop } from "lucide-react";

interface RecruiterPerspective {
  firstImpression: string;
  redFlags: string[];
  strongPoints: string[];
  hiringConfidenceScore: number;
}

interface TechnicalReview {
  techStackRelevance: string;
  projectQuality: string;
  projectImpact: string;
  githubMention: boolean;
  internshipReadiness: string;
  placementReadiness: string;
}

interface RecruiterReviewProps {
  recruiter: RecruiterPerspective;
  technical: TechnicalReview;
}

export default function RecruiterReview({ recruiter, technical }: RecruiterReviewProps) {
  const confidenceColor =
    recruiter.hiringConfidenceScore >= 76
      ? "#34d399"
      : recruiter.hiringConfidenceScore >= 51
        ? "#fbbf24"
        : "#ef4444";

  return (
    <div className="rr-recruiter">
      {/* First Impression */}
      <div className="rr-analysis-card rr-first-impression-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><Eye size={16} /></span> What a Recruiter Thinks in the First 10 Seconds
        </h4>
        <p className="rr-first-impression-text">{recruiter.firstImpression}</p>
      </div>

      {/* Hiring Confidence */}
      <div className="rr-hiring-confidence">
        <div className="rr-hiring-confidence-label">Hiring Confidence Score</div>
        <div className="rr-hiring-confidence-bar-container">
          <div
            className="rr-hiring-confidence-bar"
            style={{
              width: `${recruiter.hiringConfidenceScore}%`,
              background: confidenceColor,
              boxShadow: `0 0 12px ${confidenceColor}50`,
            }}
          />
        </div>
        <div className="rr-hiring-confidence-value" style={{ color: confidenceColor }}>
          {recruiter.hiringConfidenceScore}%
        </div>
      </div>

      {/* Red Flags & Strong Points */}
      <div className="rr-two-col">
        <div className="rr-analysis-card rr-card-danger">
          <h4 className="rr-analysis-card-title">
            <span className="rr-card-icon"><Flag size={16} /></span> Red Flags
          </h4>
          <ul className="rr-issue-list">
            {recruiter.redFlags.map((flag, i) => (
              <li key={i} className="rr-issue-item rr-issue-critical">
                <span className="rr-issue-bullet">●</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div className="rr-analysis-card rr-card-success">
          <h4 className="rr-analysis-card-title">
            <span className="rr-card-icon"><Sparkles size={16} /></span> Strong Points
          </h4>
          <ul className="rr-issue-list">
            {recruiter.strongPoints.map((point, i) => (
              <li key={i} className="rr-issue-item rr-issue-success">
                <span className="rr-issue-bullet">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Technical Candidate Review */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><Laptop size={16} /></span> Technical Candidate Review
        </h4>
        <div className="rr-tech-grid">
          {[
            { label: "Tech Stack Relevance", value: technical.techStackRelevance },
            { label: "Project Quality", value: technical.projectQuality },
            { label: "Project Impact", value: technical.projectImpact },
            { label: "GitHub Presence", value: technical.githubMention ? "✅ Mentioned" : "❌ Not mentioned" },
            { label: "Internship Readiness", value: technical.internshipReadiness },
            { label: "Placement Readiness", value: technical.placementReadiness },
          ].map((item, i) => (
            <div key={i} className="rr-tech-item">
              <span className="rr-tech-label">{item.label}</span>
              <span className="rr-tech-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
