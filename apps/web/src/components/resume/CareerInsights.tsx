// ===========================================
// Career Insights Tab Component
// ===========================================

import { Target, BarChart2, Map } from "lucide-react";

interface RoleMatch {
  role: string;
  matchPercent: number;
}

interface SkillsGap {
  currentSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
}

interface LearningRoadmap {
  thirtyDays: string[];
  sixtyDays: string[];
  ninetyDays: string[];
}

interface CareerInsightsProps {
  bestMatchingRoles: RoleMatch[];
  skillsGap: SkillsGap;
  learningRoadmap: LearningRoadmap;
}

export default function CareerInsights({
  bestMatchingRoles,
  skillsGap,
  learningRoadmap,
}: CareerInsightsProps) {
  return (
    <div className="rr-career">
      {/* Best Matching Roles */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><Target size={16} /></span> Best Matching Roles
        </h4>
        <div className="rr-roles-list">
          {bestMatchingRoles.map((role, i) => {
            const color =
              role.matchPercent >= 76 ? "#34d399" : role.matchPercent >= 51 ? "#fbbf24" : "#ef4444";
            return (
              <div key={i} className="rr-role-item">
                <div className="rr-role-info">
                  <span className="rr-role-rank">#{i + 1}</span>
                  <span className="rr-role-name">{role.role}</span>
                </div>
                <div className="rr-role-bar-container">
                  <div
                    className="rr-role-bar"
                    style={{
                      width: `${role.matchPercent}%`,
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                    }}
                  />
                </div>
                <span className="rr-role-percent" style={{ color }}>
                  {role.matchPercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Gap Analysis */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><BarChart2 size={16} /></span> Skills Gap Analysis
        </h4>
        <div className="rr-skills-gap-grid">
          <div className="rr-skills-col">
            <h5 className="rr-skills-col-title rr-text-success">Current Skills</h5>
            <div className="rr-keyword-tags">
              {skillsGap.currentSkills.map((s, i) => (
                <span key={i} className="rr-keyword-tag rr-tag-current">{s}</span>
              ))}
            </div>
          </div>
          <div className="rr-skills-col">
            <h5 className="rr-skills-col-title rr-text-danger">Missing Skills</h5>
            <div className="rr-keyword-tags">
              {skillsGap.missingSkills.map((s, i) => (
                <span key={i} className="rr-keyword-tag rr-tag-missing">{s}</span>
              ))}
            </div>
          </div>
          <div className="rr-skills-col">
            <h5 className="rr-skills-col-title rr-text-info">Recommended Skills</h5>
            <div className="rr-keyword-tags">
              {skillsGap.recommendedSkills.map((s, i) => (
                <span key={i} className="rr-keyword-tag rr-tag-suggested">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="rr-analysis-card">
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><Map size={16} /></span> Learning Roadmap
        </h4>
        <div className="rr-timeline">
          <div className="rr-timeline-phase">
            <div className="rr-timeline-marker" style={{ background: "#34d399" }}>
              <span>30</span>
            </div>
            <div className="rr-timeline-content">
              <h5 className="rr-timeline-title">30-Day Plan</h5>
              <ul className="rr-timeline-items">
                {learningRoadmap.thirtyDays.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rr-timeline-phase">
            <div className="rr-timeline-marker" style={{ background: "#fbbf24" }}>
              <span>60</span>
            </div>
            <div className="rr-timeline-content">
              <h5 className="rr-timeline-title">60-Day Plan</h5>
              <ul className="rr-timeline-items">
                {learningRoadmap.sixtyDays.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rr-timeline-phase">
            <div className="rr-timeline-marker" style={{ background: "#60a5fa" }}>
              <span>90</span>
            </div>
            <div className="rr-timeline-content">
              <h5 className="rr-timeline-title">90-Day Plan</h5>
              <ul className="rr-timeline-items">
                {learningRoadmap.ninetyDays.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
