// ===========================================
// Resume Report PDF Generator (jsPDF)
// ===========================================
import jsPDF from "jspdf";

interface ResumeReportData {
  overallScore: number;
  categoryScores: { ats: number; content: number; structure: number; keywords: number; recruiterAppeal: number };
  atsAnalysis: { score: number; compatibilityRating: string; parsingIssues: string[]; missingSections: string[]; keywordOptimization: string };
  sectionAnalysis: { name: string; grade: string; present: boolean; strengths: string[]; weaknesses: string[]; recommendations: string[] }[];
  keywordOptimization: { matchScore: number; currentKeywords: string[]; missingKeywords: string[]; suggestedKeywords: string[] };
  recruiterPerspective: { firstImpression: string; redFlags: string[]; strongPoints: string[]; hiringConfidenceScore: number };
  technicalReview: { techStackRelevance: string; projectQuality: string; projectImpact: string; githubMention: boolean; internshipReadiness: string; placementReadiness: string };
  contentQuality: { score: number; actionVerbs: string; quantifiableImpact: string; achievementStatements: string; grammarQuality: string; clarity: string; readability: string };
  improvementRoadmap: { critical: { problem: string; why: string; fix: string }[]; recommended: { problem: string; why: string; fix: string }[]; niceToHave: { problem: string; why: string; fix: string }[] };
  rewriteSuggestions: { betterSummary: string; betterProjectBullets: string[]; betterExperienceBullets: string[] };
  careerInsights: { bestMatchingRoles: { role: string; matchPercent: number }[]; skillsGap: { currentSkills: string[]; missingSkills: string[]; recommendedSkills: string[] }; learningRoadmap: { thirtyDays: string[]; sixtyDays: string[]; ninetyDays: string[] } };
  finalRecommendation: string;
}

// Color constants
const COLORS = {
  bg: [15, 20, 32] as [number, number, number],
  cardBg: [19, 25, 39] as [number, number, number],
  primary: [99, 102, 241] as [number, number, number],
  success: [52, 211, 153] as [number, number, number],
  warning: [251, 191, 36] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  info: [96, 165, 250] as [number, number, number],
  text: [226, 232, 240] as [number, number, number],
  textMuted: [148, 163, 184] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [30, 40, 61] as [number, number, number],
};

function getScoreColor(score: number): [number, number, number] {
  if (score >= 76) return COLORS.success;
  if (score >= 51) return COLORS.warning;
  return COLORS.danger;
}

class ResumeReportPDF {
  private doc: jsPDF;
  private y: number = 0;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF("p", "mm", "a4");
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.margin * 2;
  }

  private checkPageBreak(needed: number) {
    if (this.y + needed > this.pageHeight - 20) {
      this.doc.addPage();
      this.y = 20;
      // Page bg
      this.doc.setFillColor(...COLORS.bg);
      this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");
    }
  }

  private drawPageBg() {
    this.doc.setFillColor(...COLORS.bg);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");
  }

  private drawSectionTitle(title: string) {
    this.checkPageBreak(16);
    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, 10, 2, 2, "F");
    this.doc.setFontSize(12);
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin + 5, this.y + 7);
    this.y += 16;
  }

  private drawText(text: string, opts?: { size?: number; color?: [number, number, number]; bold?: boolean; maxWidth?: number }) {
    const size = opts?.size || 10;
    const color = opts?.color || COLORS.text;
    const bold = opts?.bold || false;
    const maxWidth = opts?.maxWidth || this.contentWidth;

    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
    this.doc.setFont("helvetica", bold ? "bold" : "normal");

    const lines = this.doc.splitTextToSize(text, maxWidth);
    const lineHeight = size * 0.45;

    this.checkPageBreak(lines.length * lineHeight + 2);
    this.doc.text(lines, this.margin, this.y);
    this.y += lines.length * lineHeight + 2;
  }

  private drawKeyValue(key: string, value: string) {
    this.checkPageBreak(8);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text(key + ":", this.margin + 4, this.y);

    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...COLORS.text);
    const valLines = this.doc.splitTextToSize(value, this.contentWidth - 50);
    this.doc.text(valLines, this.margin + 45, this.y);
    this.y += Math.max(valLines.length * 4.5, 6);
  }

  private drawScoreBar(label: string, score: number, x: number, width: number) {
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text(label, x, this.y);
    const scoreColor = getScoreColor(score);
    this.doc.setTextColor(...scoreColor);
    this.doc.text(`${score}`, x + width - 5, this.y);

    this.y += 3;
    this.doc.setFillColor(...COLORS.border);
    this.doc.roundedRect(x, this.y, width, 3, 1, 1, "F");
    this.doc.setFillColor(...scoreColor);
    this.doc.roundedRect(x, this.y, (score / 100) * width, 3, 1, 1, "F");
    this.y += 7;
  }

  private drawBulletList(items: string[], color?: [number, number, number]) {
    const bulletColor = color || COLORS.textMuted;
    items.forEach((item) => {
      this.checkPageBreak(8);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...bulletColor);
      this.doc.text("●", this.margin + 4, this.y);
      this.doc.setTextColor(...COLORS.text);
      const lines = this.doc.splitTextToSize(item, this.contentWidth - 14);
      this.doc.text(lines, this.margin + 10, this.y);
      this.y += lines.length * 4 + 2;
    });
  }

  // ============ COVER PAGE ============
  private drawCoverPage(candidateName: string) {
    this.drawPageBg();

    // Gradient accent bar
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 4, "F");

    // Logo area
    this.y = 70;
    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.pageWidth / 2 - 15, this.y, 30, 30, 6, 6, "F");
    this.doc.setFontSize(20);
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("AE", this.pageWidth / 2, this.y + 19, { align: "center" });

    this.y = 118;
    this.doc.setFontSize(28);
    this.doc.setTextColor(...COLORS.white);
    this.doc.text("Resume Review Report", this.pageWidth / 2, this.y, { align: "center" });

    this.y += 14;
    this.doc.setFontSize(14);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text("Professional AI-Powered Analysis", this.pageWidth / 2, this.y, { align: "center" });

    this.y += 30;
    this.doc.setFillColor(...COLORS.border);
    this.doc.rect(this.pageWidth / 2 - 30, this.y, 60, 0.5, "F");

    this.y += 16;
    this.doc.setFontSize(16);
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(candidateName || "Candidate", this.pageWidth / 2, this.y, { align: "center" });

    this.y += 12;
    this.doc.setFontSize(11);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), this.pageWidth / 2, this.y, { align: "center" });

    // Footer
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text("Generated by AgentEra • Powered by x402 Protocol on Algorand", this.pageWidth / 2, this.pageHeight - 20, { align: "center" });
  }

  // ============ EXECUTIVE SUMMARY ============
  private drawExecutiveSummary(data: ResumeReportData) {
    this.doc.addPage();
    this.drawPageBg();
    this.y = 20;

    this.drawSectionTitle("EXECUTIVE SUMMARY");

    // Overall score
    const scoreColor = getScoreColor(data.overallScore);
    this.doc.setFillColor(...COLORS.cardBg);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, 22, 3, 3, "F");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text("Overall Resume Score", this.margin + 8, this.y + 9);
    this.doc.setFontSize(22);
    this.doc.setTextColor(...scoreColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${data.overallScore}/100`, this.margin + this.contentWidth - 8, this.y + 14, { align: "right" });
    this.y += 28;

    // Category scores
    const cats = [
      { label: "ATS Compatibility", score: data.categoryScores.ats },
      { label: "Content Quality", score: data.categoryScores.content },
      { label: "Structure", score: data.categoryScores.structure },
      { label: "Keywords", score: data.categoryScores.keywords },
      { label: "Recruiter Appeal", score: data.categoryScores.recruiterAppeal },
    ];

    cats.forEach((cat) => {
      this.drawScoreBar(cat.label, cat.score, this.margin + 4, this.contentWidth - 8);
    });

    this.y += 6;
    this.drawText(data.finalRecommendation, { size: 10, color: COLORS.text });
  }

  // ============ DETAILED ANALYSIS ============
  private drawDetailedAnalysis(data: ResumeReportData) {
    this.doc.addPage();
    this.drawPageBg();
    this.y = 20;

    // ATS Analysis
    this.drawSectionTitle("ATS ANALYSIS");
    this.drawKeyValue("ATS Score", `${data.atsAnalysis.score}/100`);
    this.drawKeyValue("Compatibility", data.atsAnalysis.compatibilityRating);
    if (data.atsAnalysis.parsingIssues.length > 0) {
      this.drawText("Parsing Issues:", { size: 9, bold: true, color: COLORS.warning });
      this.drawBulletList(data.atsAnalysis.parsingIssues, COLORS.warning);
    }
    if (data.atsAnalysis.missingSections.length > 0) {
      this.drawText("Missing Sections:", { size: 9, bold: true, color: COLORS.danger });
      this.drawBulletList(data.atsAnalysis.missingSections, COLORS.danger);
    }
    this.y += 4;
    this.drawText(data.atsAnalysis.keywordOptimization, { size: 9 });

    // Recruiter Perspective
    this.y += 6;
    this.drawSectionTitle("RECRUITER PERSPECTIVE");
    this.drawText(data.recruiterPerspective.firstImpression, { size: 10 });
    this.y += 2;
    this.drawKeyValue("Hiring Confidence", `${data.recruiterPerspective.hiringConfidenceScore}%`);

    if (data.recruiterPerspective.redFlags.length > 0) {
      this.drawText("Red Flags:", { size: 9, bold: true, color: COLORS.danger });
      this.drawBulletList(data.recruiterPerspective.redFlags, COLORS.danger);
    }
    if (data.recruiterPerspective.strongPoints.length > 0) {
      this.drawText("Strong Points:", { size: 9, bold: true, color: COLORS.success });
      this.drawBulletList(data.recruiterPerspective.strongPoints, COLORS.success);
    }

    // Section Analysis
    this.y += 6;
    this.drawSectionTitle("RESUME SECTIONS");
    data.sectionAnalysis.forEach((section) => {
      this.checkPageBreak(20);
      this.doc.setFillColor(...COLORS.cardBg);
      this.doc.roundedRect(this.margin, this.y, this.contentWidth, 8, 2, 2, "F");
      this.doc.setFontSize(10);
      this.doc.setTextColor(...COLORS.white);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${section.present ? "✓" : "✕"} ${section.name}`, this.margin + 4, this.y + 5.5);
      const gradeColor = section.grade.startsWith("A") ? COLORS.success : section.grade.startsWith("B") ? COLORS.info : section.grade.startsWith("C") ? COLORS.warning : COLORS.danger;
      this.doc.setTextColor(...gradeColor);
      this.doc.text(section.grade, this.margin + this.contentWidth - 8, this.y + 5.5, { align: "right" });
      this.y += 12;

      if (section.recommendations.length > 0) {
        this.drawBulletList(section.recommendations.slice(0, 2), COLORS.info);
      }
    });
  }

  // ============ KEYWORDS ============
  private drawKeywordAnalysis(data: ResumeReportData) {
    this.checkPageBreak(50);
    this.y += 4;
    this.drawSectionTitle("KEYWORD ANALYSIS");
    this.drawKeyValue("Match Score", `${data.keywordOptimization.matchScore}%`);

    this.drawText("Current Keywords:", { size: 9, bold: true, color: COLORS.success });
    this.drawText(data.keywordOptimization.currentKeywords.join(", "), { size: 9 });
    this.y += 2;

    this.drawText("Missing Keywords:", { size: 9, bold: true, color: COLORS.danger });
    this.drawText(data.keywordOptimization.missingKeywords.join(", "), { size: 9 });
    this.y += 2;

    this.drawText("Suggested Keywords:", { size: 9, bold: true, color: COLORS.info });
    this.drawText(data.keywordOptimization.suggestedKeywords.join(", "), { size: 9 });
  }

  // ============ IMPROVEMENT ROADMAP ============
  private drawImprovementRoadmap(data: ResumeReportData) {
    this.checkPageBreak(40);
    this.y += 6;
    this.drawSectionTitle("IMPROVEMENT ROADMAP");

    const drawItems = (items: { problem: string; why: string; fix: string }[], label: string, color: [number, number, number]) => {
      if (items.length === 0) return;
      this.drawText(`${label} (${items.length})`, { size: 10, bold: true, color });
      items.forEach((item) => {
        this.checkPageBreak(18);
        this.drawText(`Problem: ${item.problem}`, { size: 9, bold: true });
        this.drawText(`Why: ${item.why}`, { size: 8, color: COLORS.textMuted });
        this.drawText(`Fix: ${item.fix}`, { size: 8, color: COLORS.success });
        this.y += 2;
      });
      this.y += 3;
    };

    drawItems(data.improvementRoadmap.critical, "🔴 Critical Fixes", COLORS.danger);
    drawItems(data.improvementRoadmap.recommended, "🟡 Recommended", COLORS.warning);
    drawItems(data.improvementRoadmap.niceToHave, "🔵 Nice To Have", COLORS.info);
  }

  // ============ CAREER INSIGHTS ============
  private drawCareerInsights(data: ResumeReportData) {
    this.checkPageBreak(40);
    this.y += 6;
    this.drawSectionTitle("CAREER INSIGHTS");

    this.drawText("Best Matching Roles:", { size: 10, bold: true });
    data.careerInsights.bestMatchingRoles.forEach((role) => {
      this.drawScoreBar(role.role, role.matchPercent, this.margin + 4, this.contentWidth - 8);
    });

    this.y += 4;
    this.drawText("Skills Gap — Missing:", { size: 9, bold: true, color: COLORS.danger });
    this.drawText(data.careerInsights.skillsGap.missingSkills.join(", "), { size: 9 });

    this.y += 2;
    this.drawText("Skills Gap — Recommended:", { size: 9, bold: true, color: COLORS.info });
    this.drawText(data.careerInsights.skillsGap.recommendedSkills.join(", "), { size: 9 });

    // Learning roadmap
    this.y += 4;
    this.drawText("Learning Roadmap:", { size: 10, bold: true });
    this.drawText("30-Day Plan:", { size: 9, bold: true, color: COLORS.success });
    this.drawBulletList(data.careerInsights.learningRoadmap.thirtyDays, COLORS.success);
    this.drawText("60-Day Plan:", { size: 9, bold: true, color: COLORS.warning });
    this.drawBulletList(data.careerInsights.learningRoadmap.sixtyDays, COLORS.warning);
    this.drawText("90-Day Plan:", { size: 9, bold: true, color: COLORS.info });
    this.drawBulletList(data.careerInsights.learningRoadmap.ninetyDays, COLORS.info);
  }

  // ============ FINAL PAGE ============
  private drawFinalPage(data: ResumeReportData) {
    this.doc.addPage();
    this.drawPageBg();
    this.y = 60;

    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, 10, 2, 2, "F");
    this.doc.setFontSize(12);
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("FINAL RECOMMENDATION", this.margin + 5, this.y + 7);
    this.y += 20;

    this.drawText(data.finalRecommendation, { size: 12, color: COLORS.text });

    this.y += 20;
    this.doc.setFillColor(...COLORS.border);
    this.doc.rect(this.pageWidth / 2 - 30, this.y, 60, 0.5, "F");

    this.y += 16;
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("This report was generated by AgentEra Resume Review Skill", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 6;
    this.doc.text("Powered by x402 Protocol on Algorand TestNet", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 6;
    this.doc.text(`Generated on ${new Date().toLocaleString()}`, this.pageWidth / 2, this.y, { align: "center" });
  }

  // ============ GENERATE ============
  public generate(data: ResumeReportData, candidateName?: string): void {
    this.drawCoverPage(candidateName || "Candidate");
    this.drawExecutiveSummary(data);
    this.drawDetailedAnalysis(data);
    this.drawKeywordAnalysis(data);
    this.drawImprovementRoadmap(data);
    this.drawCareerInsights(data);
    this.drawFinalPage(data);
    this.doc.save(`resume-review-report-${Date.now()}.pdf`);
  }
}

export function generateResumeReportPDF(data: ResumeReportData, candidateName?: string) {
  const pdf = new ResumeReportPDF();
  pdf.generate(data, candidateName);
}
