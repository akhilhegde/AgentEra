// ===========================================
// Keyword Analysis Tab Component
// ===========================================

interface KeywordData {
  matchScore: number;
  currentKeywords: string[];
  missingKeywords: string[];
  suggestedKeywords: string[];
}

interface KeywordAnalysisProps {
  data: KeywordData;
}

export default function KeywordAnalysis({ data }: KeywordAnalysisProps) {
  const scoreColor =
    data.matchScore >= 76
      ? "#34d399"
      : data.matchScore >= 51
        ? "#fbbf24"
        : "#ef4444";

  return (
    <div className="rr-keywords">
      {/* Match Score */}
      <div className="rr-keyword-score-bar">
        <div className="rr-keyword-score-header">
          <span className="rr-keyword-score-label">Keyword Match Score</span>
          <span className="rr-keyword-score-value" style={{ color: scoreColor }}>
            {data.matchScore}%
          </span>
        </div>
        <div className="rr-keyword-bar-track">
          <div
            className="rr-keyword-bar-fill"
            style={{
              width: `${data.matchScore}%`,
              background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`,
              boxShadow: `0 0 12px ${scoreColor}40`,
            }}
          />
        </div>
      </div>

      {/* Keyword Columns */}
      <div className="rr-keyword-columns">
        <div className="rr-keyword-column rr-keyword-current">
          <h4 className="rr-keyword-column-title">
            <span className="rr-kw-dot" style={{ background: "#34d399" }} />
            Current Keywords
            <span className="rr-kw-count">{data.currentKeywords.length}</span>
          </h4>
          <div className="rr-keyword-tags">
            {data.currentKeywords.map((kw, i) => (
              <span key={i} className="rr-keyword-tag rr-tag-current">{kw}</span>
            ))}
          </div>
        </div>

        <div className="rr-keyword-column rr-keyword-missing">
          <h4 className="rr-keyword-column-title">
            <span className="rr-kw-dot" style={{ background: "#ef4444" }} />
            Missing Keywords
            <span className="rr-kw-count">{data.missingKeywords.length}</span>
          </h4>
          <div className="rr-keyword-tags">
            {data.missingKeywords.map((kw, i) => (
              <span key={i} className="rr-keyword-tag rr-tag-missing">{kw}</span>
            ))}
          </div>
        </div>

        <div className="rr-keyword-column rr-keyword-suggested">
          <h4 className="rr-keyword-column-title">
            <span className="rr-kw-dot" style={{ background: "#60a5fa" }} />
            Suggested Keywords
            <span className="rr-kw-count">{data.suggestedKeywords.length}</span>
          </h4>
          <div className="rr-keyword-tags">
            {data.suggestedKeywords.map((kw, i) => (
              <span key={i} className="rr-keyword-tag rr-tag-suggested">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
