// ===========================================
// Resume Sections Tab — Accordion Analysis
// ===========================================
import { useState } from "react";
import { FileEdit } from "lucide-react";

interface SectionData {
  name: string;
  grade: string;
  present: boolean;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ContentQuality {
  score: number;
  actionVerbs: string;
  quantifiableImpact: string;
  achievementStatements: string;
  grammarQuality: string;
  clarity: string;
  readability: string;
}

interface ResumeSectionsProps {
  sections: SectionData[];
  contentQuality: ContentQuality;
}

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "#34d399";
  if (grade.startsWith("B")) return "#60a5fa";
  if (grade.startsWith("C")) return "#fbbf24";
  return "#ef4444";
}

function SectionAccordion({ section }: { section: SectionData }) {
  const [open, setOpen] = useState(false);
  const gradeColor = getGradeColor(section.grade);

  return (
    <div className={`rr-accordion ${open ? "rr-accordion-open" : ""}`}>
      <button className="rr-accordion-header" onClick={() => setOpen(!open)}>
        <div className="rr-accordion-left">
          <span className={`rr-section-status ${section.present ? "rr-present" : "rr-missing"}`}>
            {section.present ? "✓" : "✕"}
          </span>
          <span className="rr-accordion-title">{section.name}</span>
        </div>
        <div className="rr-accordion-right">
          <span
            className="rr-grade-badge"
            style={{ background: `${gradeColor}20`, color: gradeColor, borderColor: `${gradeColor}40` }}
          >
            {section.grade}
          </span>
          <span className={`rr-accordion-chevron ${open ? "rr-chevron-open" : ""}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="rr-accordion-body">
          {section.strengths.length > 0 && (
            <div className="rr-accordion-section">
              <h5 className="rr-accordion-subtitle rr-text-success">Strengths</h5>
              <ul className="rr-issue-list">
                {section.strengths.map((s, i) => (
                  <li key={i} className="rr-issue-item rr-issue-success">
                    <span className="rr-issue-bullet">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.weaknesses.length > 0 && (
            <div className="rr-accordion-section">
              <h5 className="rr-accordion-subtitle rr-text-danger">Weaknesses</h5>
              <ul className="rr-issue-list">
                {section.weaknesses.map((w, i) => (
                  <li key={i} className="rr-issue-item rr-issue-critical">
                    <span className="rr-issue-bullet">✕</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.recommendations.length > 0 && (
            <div className="rr-accordion-section">
              <h5 className="rr-accordion-subtitle rr-text-info">Recommendations</h5>
              <ul className="rr-issue-list">
                {section.recommendations.map((r, i) => (
                  <li key={i} className="rr-issue-item rr-issue-info">
                    <span className="rr-issue-bullet">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResumeSections({ sections, contentQuality }: ResumeSectionsProps) {
  const qualityItems = [
    { label: "Action Verbs", value: contentQuality.actionVerbs },
    { label: "Quantifiable Impact", value: contentQuality.quantifiableImpact },
    { label: "Achievement Statements", value: contentQuality.achievementStatements },
    { label: "Grammar Quality", value: contentQuality.grammarQuality },
    { label: "Clarity", value: contentQuality.clarity },
    { label: "Readability", value: contentQuality.readability },
  ];

  const qualityColor =
    contentQuality.score >= 76
      ? "#34d399"
      : contentQuality.score >= 51
        ? "#fbbf24"
        : "#ef4444";

  return (
    <div className="rr-sections">
      {/* Section Accordions */}
      <div className="rr-accordions">
        {sections.map((section, i) => (
          <SectionAccordion key={i} section={section} />
        ))}
      </div>

      {/* Content Quality Analysis */}
      <div className="rr-analysis-card" style={{ marginTop: "20px" }}>
        <h4 className="rr-analysis-card-title">
          <span className="rr-card-icon"><FileEdit size={16} /></span> Content Quality Score
          <span
            className="rr-inline-score"
            style={{ color: qualityColor, marginLeft: "auto" }}
          >
            {contentQuality.score}/100
          </span>
        </h4>
        <div className="rr-quality-grid">
          {qualityItems.map((item, i) => (
            <div key={i} className="rr-quality-item">
              <span className="rr-quality-label">{item.label}</span>
              <span className="rr-quality-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
