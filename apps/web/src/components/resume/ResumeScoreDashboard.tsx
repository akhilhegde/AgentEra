// ===========================================
// Resume Score Dashboard — Overview Tab
// ===========================================
import { useEffect, useState } from "react";
import { Bot, PenTool, Ruler, Key, UserSquare2, ClipboardCheck } from "lucide-react";

interface ScoreCircleProps {
  score: number;
  size?: number;
  label?: string;
  delay?: number;
}

function ScoreCircle({ score, size = 180, label, delay = 0 }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = size > 100 ? 10 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 76) return "#34d399";
    if (s >= 51) return "#fbbf24";
    return "#ef4444";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 12);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="score-circle-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="score-circle-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e283d"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(animatedScore)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-circle-progress"
          style={{
            filter: `drop-shadow(0 0 6px ${getColor(animatedScore)}60)`,
          }}
        />
      </svg>
      <div className="score-circle-text">
        <span className="score-circle-number" style={{ color: getColor(animatedScore) }}>
          {animatedScore}
        </span>
        <span className="score-circle-label">{label || "Overall"}</span>
      </div>
    </div>
  );
}

interface CategoryScores {
  ats: number;
  content: number;
  structure: number;
  keywords: number;
  recruiterAppeal: number;
}

interface ResumeScoreDashboardProps {
  overallScore: number;
  categoryScores: CategoryScores;
  finalRecommendation: string;
}

function ScoreCard({
  label,
  score,
  icon,
  delay,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
  delay: number;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const getColor = (s: number) => {
    if (s >= 76) return "#34d399";
    if (s >= 51) return "#fbbf24";
    return "#ef4444";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="rr-score-card">
      <div className="rr-score-card-header">
        <span className="rr-score-card-icon">{icon}</span>
        <span className="rr-score-card-label">{label}</span>
      </div>
      <div className="rr-score-card-value" style={{ color: getColor(animatedScore) }}>
        {animatedScore}
      </div>
      <div className="rr-score-card-bar">
        <div
          className="rr-score-card-bar-fill"
          style={{
            width: `${animatedScore}%`,
            background: getColor(animatedScore),
            boxShadow: `0 0 8px ${getColor(animatedScore)}40`,
          }}
        />
      </div>
    </div>
  );
}

export default function ResumeScoreDashboard({
  overallScore,
  categoryScores,
  finalRecommendation,
}: ResumeScoreDashboardProps) {
  const categories = [
    { label: "ATS Compatibility", score: categoryScores.ats, icon: <Bot size={16} /> },
    { label: "Content Quality", score: categoryScores.content, icon: <PenTool size={16} /> },
    { label: "Structure", score: categoryScores.structure, icon: <Ruler size={16} /> },
    { label: "Keywords", score: categoryScores.keywords, icon: <Key size={16} /> },
    { label: "Recruiter Appeal", score: categoryScores.recruiterAppeal, icon: <UserSquare2 size={16} /> },
  ];

  return (
    <div className="rr-overview">
      <div className="rr-overview-top">
        <div className="rr-overview-circle">
          <ScoreCircle score={overallScore} size={200} label="Overall Score" />
        </div>
        <div className="rr-overview-cards">
          {categories.map((cat, i) => (
            <ScoreCard key={cat.label} {...cat} delay={200 + i * 150} />
          ))}
        </div>
      </div>

      <div className="rr-final-recommendation">
        <div className="rr-final-recommendation-header">
          <span className="rr-final-icon"><ClipboardCheck size={20} /></span>
          <h3>Final Recommendation</h3>
        </div>
        <p>{finalRecommendation}</p>
      </div>
    </div>
  );
}
