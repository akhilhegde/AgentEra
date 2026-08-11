// ===========================================
// Skill Execution Page
// ===========================================
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Sparkles, ShieldCheck, Cpu, ArrowRight, Upload, CheckCircle2, Download } from "lucide-react";
import { fetchSkill, executeSkill, executeSkillWithPayment, fetchPublicConfig, type Skill, type SkillExecutionResponse } from "../services/api";
import { TransactionReceipt } from "../components/TransactionReceipt";
import { ConfirmPaymentModal } from "../components/ConfirmPaymentModal";
import { usePaymentStore } from "../stores/payment.store";
import { useWalletStore } from "../stores/wallet.store";
import { sendUsdc } from "../services/transactions";
import { connectWallet } from "../services/peraWallet";
import ReactMarkdown from "react-markdown";

const SAMPLE_INPUTS: Record<string, string> = {
  "resume-review":
    "Target Role: Senior Full-Stack Engineer (FinTech / Blockchain)\n\nResume Summary:\nSenior Software Engineer with 5+ years of experience building scalable Web3 applications, React frontends, and Node.js microservices. Led a team of 4 engineers to launch a decentralized payment protocol on Algorand processing $100k daily volume.",
  "logo-design":
    "Brand Name: AgentHub\nIndustry: AI & Blockchain Infrastructure\nPreferred Style: Minimalist Futuristic Tech\nPreferred Colors: Indigo (#6366F1), Emerald (#10B981), Obsidian (#0F172A)\nSlogan: Pay only for the skill you use\nDescription: A sleek, modern logo featuring a stylized geometric 'A' intertwined with a neural network node and blockchain link.",
  "code-review":
    "Language: TypeScript\nExpected Behavior: Safely calculate item totals and handle missing price fields.\n\nCode:\nfunction calculateTotal(items) {\n  let total = 0;\n  for (var i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
  "ppt-generator":
    "Topic: x402 Micropayments for Autonomous AI Agents\nSlide Count: 5 slides\nTarget Audience: Web3 Investors & AI Developers\nPurpose: Pitching AgentHub at a Web3 Hackathon Demo\nPreferred Style: Clean Dark Glassmorphism",
  "research":
    "Research Topic: HTTP 402 Payment Required Protocol in AI Agent Ecosystems\nCore Questions: How does x402 differ from traditional SaaS subscriptions? What are the latency and fee advantages of Algorand for sub-cent AI micropayments?\nDepth: Comprehensive Analysis\nTarget Audience: Technical Co-founders and Protocol Engineers",
  "interview-prep":
    "Job Role: Principal Frontend Architect\nCompany / Industry: Decentralized Finance (DeFi) Platform\nExperience Level: Senior (7+ years)\nKey Skills: React 19, TypeScript, Web3 Signers, Performance Optimization, Micro-frontends",
};

export function SkillPage() {
  const { id } = useParams<{ id: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [result, setResult] = useState<SkillExecutionResponse | null>(null);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [config, setConfig] = useState<any>(null);
  
  const addPayment = usePaymentStore((s) => s.addPayment);
  const { isConnected, address, hasUsdcOptIn, usdcBalance, algoBalance } = useWalletStore();

  useEffect(() => {
    fetchPublicConfig().then(setConfig).catch(console.error);
    if (id) {
      fetchSkill(id)
        .then((s) => {
          setSkill(s);
          const key = s?.slug || s?.id;
          if (key && SAMPLE_INPUTS[key]) {
            setInput(SAMPLE_INPUTS[key]);
          }
        })
        .catch(console.error)
        .finally(() => setPageLoading(false));
    }
  }, [id]);

  const loadSample = () => {
    if (!skill) return;
    const key = skill.slug || skill.id;
    if (SAMPLE_INPUTS[key]) {
      setInput(SAMPLE_INPUTS[key]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!result || !result.result || !result.result.content) return;
    const blob = new Blob([result.result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill?.slug || skill?.name.toLowerCase().replace(/\s+/g, '-')}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWalletPaymentFlow = async () => {
    if (!config || !skill) {
      setError("Failed to load network configuration. Please try again.");
      return;
    }
    setLoading(true);
    setExecutionStep(1); // Checking balances
    setError("");
    setResult(null);

    try {
      if (!hasUsdcOptIn) throw new Error('Please enable USDC in your wallet menu first.');
      const requiredAmount = parseFloat(skill.price);
      if (parseFloat(usdcBalance || '0') < requiredAmount) throw new Error(`Insufficient Balance: You need ${requiredAmount} USDC.`);
      if (parseFloat(algoBalance || '0') < 0.002) throw new Error('Insufficient ALGO: You need ALGO to pay transaction fees.');

      setExecutionStep(2); // Waiting for Pera Approval
      const txId = await sendUsdc(address!, config.receiverAddress, skill.price.toString(), skill.id);
      
      setExecutionStep(3); // Settled, executing skill
      const response = await executeSkillWithPayment(skill.id, input, txId, fileData);

      if ("success" in response && response.success) {
        setExecutionStep(5); // Running AI finished
        const execResponse = response as SkillExecutionResponse;
        setResult(execResponse);
        addPayment(execResponse, skill.name);
      } else {
        setExecutionStep(0);
        setError((response as any).error || "Execution failed");
      }
    } catch (e: any) {
      setExecutionStep(0);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!skill || !input.trim()) return;
    
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
      return;
    }
    
    return handleWalletPaymentFlow();
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Skill not found</p>
        <Link to="/marketplace" className="text-indigo-400 hover:text-indigo-300">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const skillKey = skill.slug || skill.id;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Skill Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{skill.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-white">{skill.name}</h1>
                <p className="text-slate-400 mt-1">{skill.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {skill.category}
                  </span>
                  <span className="text-xs text-slate-400">Network: Algorand TestNet</span>
                  <span className="text-xs text-slate-500">by {skill.provider}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold gradient-text">${skill.price}</div>
              <div className="text-xs text-emerald-400 font-semibold">{skill.currency} per execution</div>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-slate-200">
              {skill.inputSchema.label}
            </label>
            {SAMPLE_INPUTS[skillKey] && (
              <button
                onClick={loadSample}
                type="button"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" /> Load Sample Input
              </button>
            )}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={skill.inputSchema.placeholder}
            maxLength={skill.inputSchema.maxLength}
            rows={9}
            className="w-full p-5 rounded-xl bg-[#0f0f23] border border-[#2d2d5e] text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-colors resize-y font-mono text-[15px] leading-relaxed shadow-inner"
          />
          {skill.inputSchema.maxLength && (
            <div className="text-xs text-slate-500 mt-1 text-right">
              {input.length} / {skill.inputSchema.maxLength}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="marketplace-file-upload" className="cursor-pointer text-xs flex items-center gap-2 bg-indigo-500/10 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 px-3 py-2 rounded-lg border border-indigo-500/30 transition-all">
              <Upload className="w-3.5 h-3.5" /> {fileName ? 'Change File' : 'Upload File (PDF, DOCX, PNG)'}
            </label>
            <input
              id="marketplace-file-upload"
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
            {fileName && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {fileName}
              </span>
            )}
          </div>

          <button
            onClick={async () => {
              if (!isConnected) {
                try {
                  await connectWallet();
                } catch (err) {
                  console.error("Failed to connect wallet", err);
                }
              } else {
                setShowConfirmModal(true);
              }
            }}
            disabled={loading || !input.trim()}
            className="glow-btn w-full mt-5 py-3 text-base flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                {isConnected ? "Pay via Pera Wallet & Run " : "Connect Wallet to Pay & Run "}{skill.name} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {showConfirmModal && (
            <ConfirmPaymentModal
              skill={skill}
              input={input}
              fileName={fileName}
              onClose={() => setShowConfirmModal(false)}
              onConfirmPay={handleExecute}
            />
          )}

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Protected by x402 Protocol • Settled on Algorand TestNet in USDC</span>
          </div>
        </div>

        {/* Live x402 Execution Progress Tracker */}
        {loading && (
          <div className="glass-card p-6 mb-6 border-indigo-500/30">
            <h3 className="font-bold text-indigo-300 text-sm mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" /> Live x402 Execution Pipeline
            </h3>
            <div className="space-y-3 text-xs">
              <div className={`flex items-center justify-between p-2.5 rounded-lg ${executionStep >= 1 ? "bg-indigo-500/10 text-indigo-200 border border-indigo-500/20" : "text-slate-500"}`}>
                <span>1. Requesting skill endpoint ({skill.endpoint})</span>
                {executionStep === 1 && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
                {executionStep > 1 && <span className="text-emerald-400 font-bold">✓ Sent</span>}
              </div>
              <div className={`flex items-center justify-between p-2.5 rounded-lg ${executionStep >= 2 ? "bg-amber-500/10 text-amber-200 border border-amber-500/20" : "text-slate-500"}`}>
                <span>2. HTTP 402 Payment Required (${skill.price} {skill.currency} on Algorand TestNet)</span>
                {executionStep === 2 && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                {executionStep > 2 && <span className="text-amber-300 font-bold">✓ 402 Handled</span>}
              </div>
              <div className={`flex items-center justify-between p-2.5 rounded-lg ${executionStep >= 3 ? "bg-purple-500/10 text-purple-200 border border-purple-500/20" : "text-slate-500"}`}>
                <span>3. Signing & Settling USDC Payment on Algorand TestNet</span>
                {executionStep === 3 && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />}
                {executionStep > 3 && <span className="text-emerald-400 font-bold">✓ Settled</span>}
              </div>
              <div className={`flex items-center justify-between p-2.5 rounded-lg ${executionStep >= 4 ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20" : "text-slate-500"}`}>
                <span>4. Running AI Skill (Google Gemini gemini-3.6-flash)</span>
                {executionStep === 4 && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
                {executionStep > 4 && <span className="text-emerald-400 font-bold">✓ Completed</span>}
              </div>
            </div>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="glass-card p-5 mb-6 border-red-500/40 bg-red-500/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-bold text-sm">Execution Error</p>
              <p className="text-xs text-red-300/90 mt-1 font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* On-Chain Transaction Receipt */}
        {result && <TransactionReceipt data={result} />}

        {/* AI Skill Output Card */}
        {result && (
          <div className="glass-card p-6 mt-6 border-indigo-500/30">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2d2d5e]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> {skill.name} Output
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="text-xs flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download Report
                </button>
                <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Format: {result.result.format || "markdown"}
                </span>
              </div>
            </div>
            <div className="markdown-output text-slate-200 leading-relaxed text-sm">
              <ReactMarkdown>{result.result.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
