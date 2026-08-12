// ===========================================
// Resume Review Page — Premium Experience
// ===========================================
import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft, Upload, FileText, Loader2, AlertCircle,
  Sparkles, ShieldCheck, Wallet, Download, CheckCircle2, RefreshCw,
  LayoutDashboard, Bot, UserSquare2, LayoutList, Key, Wrench, Target
} from "lucide-react";
import { fetchSkill, executeSkillWithPayment, fetchPublicConfig, type Skill } from "../services/api";
import { useWalletStore } from "../stores/wallet.store";
import { usePaymentStore } from "../stores/payment.store";
import { sendUsdc } from "../services/transactions";
import { connectWallet } from "../services/peraWallet";
import ResumeScoreDashboard from "../components/resume/ResumeScoreDashboard";
import ATSAnalysis from "../components/resume/ATSAnalysis";
import RecruiterReview from "../components/resume/RecruiterReview";
import ResumeSections from "../components/resume/ResumeSections";
import KeywordAnalysis from "../components/resume/KeywordAnalysis";
import ImprovementRoadmap from "../components/resume/ImprovementRoadmap";
import CareerInsights from "../components/resume/CareerInsights";
import { generateResumeReportPDF } from "../components/resume/ResumeReportPDF";

const TABS = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
  { id: "ats", label: "ATS Analysis", icon: <Bot size={14} /> },
  { id: "recruiter", label: "Recruiter Review", icon: <UserSquare2 size={14} /> },
  { id: "sections", label: "Resume Sections", icon: <LayoutList size={14} /> },
  { id: "keywords", label: "Keywords", icon: <Key size={14} /> },
  { id: "improvements", label: "Improvements", icon: <Wrench size={14} /> },
  { id: "career", label: "Career Insights", icon: <Target size={14} /> },
];

const SAMPLE_INPUT =
  "Target Role: Senior Full-Stack Engineer (FinTech / Blockchain)\n\nResume Summary:\nSenior Software Engineer with 5+ years of experience building scalable Web3 applications, React frontends, and Node.js microservices. Led a team of 4 engineers to launch a decentralized payment protocol on Algorand processing $100k daily volume.";

export default function ResumeReviewPage({ onViewChange }: { onViewChange: (view: string) => void }) {
  // State
  const [skill, setSkill] = useState<Skill | null>(null);
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [config, setConfig] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address, hasUsdcOptIn, usdcBalance, algoBalance } = useWalletStore();
  const addPayment = usePaymentStore((s) => s.addPayment);

  // Load skill and config
  useEffect(() => {
    fetchPublicConfig().then(setConfig).catch(console.error);
    fetchSkill("resume-reviewer")
      .then((s) => {
        if (s) setSkill(s);
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, []);



  // File handling
  const processFile = useCallback((file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => setFileData(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Payment + Execution
  const handleExecute = async () => {
    if (!skill || !input.trim()) return;

    if (!isConnected) {
      try { await connectWallet(); } catch { /* user cancelled */ }
      return;
    }

    if (!config) {
      setError("Failed to load network configuration.");
      return;
    }

    setLoading(true);
    setExecutionStep(1);
    setError("");
    setReportData(null);

    try {
      if (!hasUsdcOptIn) throw new Error("Please enable USDC in your wallet menu first.");
      const requiredAmount = parseFloat(skill.price);
      if (parseFloat(usdcBalance || "0") < requiredAmount) throw new Error(`Insufficient Balance: You need ${requiredAmount} USDC.`);
      if (parseFloat(algoBalance || "0") < 0.002) throw new Error("Insufficient ALGO for transaction fees.");

      setExecutionStep(2);
      if (!config.receiverAddress) {
        throw new Error('Server configuration error: RECEIVER_ADDRESS is missing. Please add it to your Vercel Environment Variables.');
      }

      const txId = await sendUsdc(address!, config.receiverAddress, skill.price.toString(), skill.id);

      setExecutionStep(3);
      const response = await executeSkillWithPayment(skill.id, input, txId, fileData);

      if ("success" in response && response.success) {
        setExecutionStep(4);

        // Parse the AI JSON response
        let parsed: any;
        try {
          let content = response.result.content;
          // Strip code fences if AI wraps in ```json
          content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
          parsed = JSON.parse(content);
        } catch {
          // Fallback: try to extract JSON from the response
          const jsonMatch = response.result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Failed to parse AI response as structured data.");
          }
        }

        setReportData(parsed);
        addPayment(response as any, skill.name);

        setExecutionStep(5);
      } else {
        throw new Error((response as any).error || "Execution failed");
      }
    } catch (e: any) {
      setExecutionStep(0);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setReportData(null);
    setExecutionStep(0);
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    generateResumeReportPDF(reportData, "Candidate");
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="rr-page">
        <div className="rr-loading-page">
          <div className="rr-spinner" />
          <p>Loading Resume Review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rr-page">
      <div className="rr-container">
        {/* Back button */}
        <button onClick={() => onViewChange("home")} className="rr-back-btn">
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        {/* Skill Header */}
        <div className="rr-header-card">
          <div className="rr-header-left">
            <span className="rr-header-icon">📄</span>
            <div>
              <h1 className="rr-title">Resume Review</h1>
              <p className="rr-subtitle">
                Professional AI-Powered Resume Analysis
              </p>
              <div className="rr-header-tags">
                <span className="rr-tag-category">Career</span>
                <span className="rr-tag-network">Algorand TestNet</span>
                <span className="rr-tag-provider">by AgentEra Labs</span>
              </div>
            </div>
          </div>
          {skill && (
            <div className="rr-header-price">
              <span className="rr-price-value">${skill.price}</span>
              <span className="rr-price-label">USDC per analysis</span>
            </div>
          )}
        </div>

        {/* Results Dashboard (shown after successful analysis) */}
        {reportData ? (
          <div className="rr-results">
            {/* Tab Navigation */}
            <div className="rr-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`rr-tab ${activeTab === tab.id ? "rr-tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="rr-tab-icon">{tab.icon}</span>
                  <span className="rr-tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="rr-tab-content">
              {activeTab === "overview" && (
                <ResumeScoreDashboard
                  overallScore={reportData.overallScore}
                  categoryScores={reportData.categoryScores}
                  finalRecommendation={reportData.finalRecommendation}
                />
              )}
              {activeTab === "ats" && <ATSAnalysis data={reportData.atsAnalysis} />}
              {activeTab === "recruiter" && (
                <RecruiterReview
                  recruiter={reportData.recruiterPerspective}
                  technical={reportData.technicalReview}
                />
              )}
              {activeTab === "sections" && (
                <ResumeSections
                  sections={reportData.sectionAnalysis}
                  contentQuality={reportData.contentQuality}
                />
              )}
              {activeTab === "keywords" && <KeywordAnalysis data={reportData.keywordOptimization} />}
              {activeTab === "improvements" && (
                <ImprovementRoadmap
                  critical={reportData.improvementRoadmap.critical}
                  recommended={reportData.improvementRoadmap.recommended}
                  niceToHave={reportData.improvementRoadmap.niceToHave}
                  rewriteSuggestions={reportData.rewriteSuggestions}
                />
              )}
              {activeTab === "career" && (
                <CareerInsights
                  bestMatchingRoles={reportData.careerInsights.bestMatchingRoles}
                  skillsGap={reportData.careerInsights.skillsGap}
                  learningRoadmap={reportData.careerInsights.learningRoadmap}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="rr-result-actions">
              <button className="rr-btn-pdf" onClick={handleDownloadPDF}>
                <Download size={16} /> Download PDF Report
              </button>
              <button className="rr-btn-new" onClick={handleRetry}>
                <RefreshCw size={16} /> New Analysis
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Section */}
            <div className="rr-upload-section">
              <div
                className={`rr-upload-zone ${isDragging ? "rr-upload-zone-active" : ""} ${fileName ? "rr-upload-zone-filled" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="rr-file-input-hidden"
                />

                {fileName ? (
                  <div className="rr-file-preview">
                    <div className="rr-file-icon-large">
                      <FileText size={32} />
                    </div>
                    <div className="rr-file-info">
                      <span className="rr-file-name">
                        <CheckCircle2 size={14} /> {fileName}
                      </span>
                      <span className="rr-file-size">{fileSize}</span>
                    </div>
                    <button
                      className="rr-file-change"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div className="rr-upload-placeholder">
                    <div className="rr-upload-icon-wrapper">
                      <Upload size={28} />
                    </div>
                    <p className="rr-upload-title">
                      Drag & Drop your resume here
                    </p>
                    <p className="rr-upload-subtitle">or click to browse</p>
                    <div className="rr-upload-formats">
                      <span className="rr-format-badge">PDF</span>
                      <span className="rr-format-badge">DOCX</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="rr-upload-info">
                <ShieldCheck size={14} /> Your resume will be analyzed for ATS
                compatibility, recruiter impact, keyword optimization, formatting
                quality, and role alignment.
              </p>
            </div>

            {/* Text Input */}
            <div className="rr-input-card">
              <div className="rr-input-header">
                <label>Resume Text & Target Role</label>
                <button
                  className="rr-sample-btn"
                  onClick={() => setInput(SAMPLE_INPUT)}
                  type="button"
                >
                  <Sparkles size={13} /> Load Sample
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your resume content and target role..."
                rows={10}
                className="rr-textarea"
                maxLength={12000}
              />
              <div className="rr-char-count">
                {input.length} / 12,000
              </div>
            </div>

            {/* Execution Pipeline */}
            {loading && (
              <div className="rr-pipeline-card">
                <h3 className="rr-pipeline-title">
                  <Wallet size={16} /> Execution Pipeline
                </h3>
                <div className="rr-pipeline-steps">
                  {[
                    { step: 1, label: "Checking wallet balances", activeLabel: "Balances verified" },
                    { step: 2, label: "Waiting for Pera Wallet approval", activeLabel: "Transaction signed" },
                    { step: 3, label: "Running AI analysis (this may take a moment)", activeLabel: "Payment settled" },
                    { step: 4, label: "Generating comprehensive report", activeLabel: "AI analysis complete" },
                    { step: 5, label: "Report ready!", activeLabel: "Report ready" },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`rr-pipeline-step ${executionStep > s.step ? "rr-step-done" : executionStep === s.step ? "rr-step-active" : "rr-step-pending"}`}
                    >
                      <div className="rr-step-indicator">
                        {executionStep > s.step ? (
                          <CheckCircle2 size={16} />
                        ) : executionStep === s.step ? (
                          <Loader2 size={16} className="rr-spin" />
                        ) : (
                          <span className="rr-step-dot" />
                        )}
                      </div>
                      <span className="rr-step-label">
                        {executionStep > s.step ? s.activeLabel : s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rr-error-card">
                <AlertCircle size={18} />
                <div>
                  <p className="rr-error-title">Error</p>
                  <p className="rr-error-text">{error}</p>
                </div>
                <button className="rr-retry-btn" onClick={handleRetry}>
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}

            {/* CTA Button */}
            <button
              className="rr-cta-btn"
              onClick={handleExecute}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="rr-spin" /> Analyzing Resume...
                </>
              ) : (
                <>
                  {isConnected ? "Pay via Pera Wallet & Analyze" : "Connect Wallet to Analyze"}{" "}
                  {skill && <span className="rr-cta-price">${skill.price} USDC</span>}
                </>
              )}
            </button>

            <div className="rr-protocol-badge">
              <ShieldCheck size={14} />
              Protected by x402 Protocol • Settled on Algorand TestNet in USDC
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Utilities
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}
