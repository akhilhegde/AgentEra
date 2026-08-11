import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, Loader2, AlertCircle, ExternalLink, CheckCircle2, ArrowRight, Wallet, Cpu, Briefcase, PenTool, Layers3, FileText, Compass, Database, Upload, Download } from 'lucide-react';
import { executeSkill, executeSkillWithPayment, fetchPublicConfig } from '../services/api';
import { connectWallet } from '../services/peraWallet';
import { useWalletStore } from '../stores/wallet.store';
import { sendUsdc } from '../services/transactions';
import TransactionProgress from './TransactionProgress';
import ReactMarkdown from 'react-markdown';

const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('career')) return <Briefcase size={24} />;
  if (cat.includes('design')) return <PenTool size={24} />;
  if (cat.includes('development')) return <Layers3 size={24} />;
  if (cat.includes('productivity')) return <FileText size={24} />;
  if (cat.includes('research')) return <Compass size={24} />;
  if (cat.includes('data')) return <Database size={24} />;
  return <Sparkles size={24} />;
};

const SAMPLE_INPUTS = {
  "resume-review":
    "Target Role: Senior Full-Stack Engineer (FinTech / Blockchain)\n\nResume Summary:\nSenior Software Engineer with 5+ years of experience building scalable Web3 applications, React frontends, and Node.js microservices. Led a team of 4 engineers to launch a decentralized payment protocol on Algorand processing $100k daily volume.",
  "logo-design":
    "Brand Name: AgentEra\nIndustry: AI & Blockchain Infrastructure\nPreferred Style: Minimalist Futuristic Tech\nPreferred Colors: Indigo (#6366F1), Emerald (#10B981), Obsidian (#0F172A)\nSlogan: Pay only for the skill you use\nDescription: A sleek, modern logo featuring a stylized geometric 'A' intertwined with a neural network node and blockchain link.",
  "code-review":
    "Language: TypeScript\nExpected Behavior: Safely calculate item totals and handle missing price fields.\n\nCode:\nfunction calculateTotal(items) {\n  let total = 0;\n  for (var i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
  "ppt-generator":
    "Topic: x402 Micropayments for Autonomous AI Agents\nSlide Count: 5 slides\nTarget Audience: Web3 Investors & AI Developers\nPurpose: Pitching AgentEra at a Web3 Hackathon Demo\nPreferred Style: Clean Dark Glassmorphism",
  "research":
    "Research Topic: HTTP 402 Payment Required Protocol in AI Agent Ecosystems\nCore Questions: How does x402 differ from traditional SaaS subscriptions? What are the latency and fee advantages of Algorand for sub-cent AI micropayments?\nDepth: Comprehensive Analysis\nTarget Audience: Technical Co-founders and Protocol Engineers",
  "interview-prep":
    "Job Role: Principal Frontend Architect\nCompany / Industry: Decentralized Finance (DeFi) Platform\nExperience Level: Senior (7+ years)\nKey Skills: React 19, TypeScript, Web3 Signers, Performance Optimization, Micro-frontends",
};

export default function PaymentModal({ skill, onClose, onToast }) {
  const { isConnected, address, hasUsdcOptIn, usdcBalance, algoBalance } = useWalletStore();
  const [input, setInput] = useState(SAMPLE_INPUTS[skill.slug || skill.id] || '');
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState(0); 
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  
  const [config, setConfig] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!resultData || !resultData.result || !resultData.result.content) return;
    const blob = new Blob([resultData.result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.slug || skill.name.toLowerCase().replace(/\s+/g, '-')}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchPublicConfig().then(setConfig).catch(console.error);
  }, []);

  const loadSample = () => {
    if (SAMPLE_INPUTS[skill.slug || skill.id]) {
      setInput(SAMPLE_INPUTS[skill.slug || skill.id]);
      onToast('Sample input loaded for ' + skill.name);
    }
  };

  const handleWalletPaymentFlow = async () => {
    if (!config) {
      setError("Failed to load network configuration. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultData(null);
    
    let currentSteps = [
      { id: 'connect', label: 'Wallet Connected', status: 'success' },
      { id: 'check', label: 'Checking Balances', status: 'loading' }
    ];
    setProgressSteps([...currentSteps]);

    try {
      if (!hasUsdcOptIn) {
        currentSteps = [
          ...currentSteps.slice(0, 1),
          { id: 'check', label: 'USDC Not Enabled', status: 'error', message: 'Please enable USDC in your wallet menu first.' }
        ];
        setProgressSteps(currentSteps);
        setError('Please enable USDC in your wallet menu first.');
        setLoading(false);
        return;
      }
      
      const requiredAmount = parseFloat(skill.price);
      if (parseFloat(usdcBalance || '0') < requiredAmount) {
         currentSteps = [
           ...currentSteps.slice(0, 1),
           { id: 'check', label: 'Insufficient Balance', status: 'error', message: `You need ${requiredAmount} USDC but have ${usdcBalance}.` }
         ];
         setProgressSteps(currentSteps);
         setError(`Insufficient Balance: You need ${requiredAmount} USDC but have ${usdcBalance}.`);
         setLoading(false);
         return;
      }

      if (parseFloat(algoBalance || '0') < 0.002) {
         currentSteps = [
           ...currentSteps.slice(0, 1),
           { id: 'check', label: 'Insufficient ALGO', status: 'error', message: 'You need ALGO to pay transaction fees.' }
         ];
         setProgressSteps(currentSteps);
         setError('Insufficient ALGO: You need ALGO to pay transaction fees.');
         setLoading(false);
         return;
      }

      currentSteps = [
        ...currentSteps.slice(0, 1),
        { id: 'check', label: 'Balances Verified', status: 'success' },
        { id: 'sign', label: 'Waiting for Pera Approval', status: 'loading', message: 'Please check your Pera Wallet to sign the transaction.' }
      ];
      setProgressSteps([...currentSteps]);

      let txId;
      try {
        txId = await sendUsdc(address, config.receiverAddress, skill.price.toString(), skill.id);
      } catch (err) {
        currentSteps = [
          ...currentSteps.slice(0, 2),
          { id: 'sign', label: 'Transaction Failed or Cancelled', status: 'error', message: err?.message || 'Cancelled in Pera Wallet' }
        ];
        setProgressSteps(currentSteps);
        setError(err?.message || 'Cancelled in Pera Wallet');
        setLoading(false);
        return;
      }

      currentSteps = [
        ...currentSteps.slice(0, 2),
        { id: 'sign', label: 'Transaction Signed', status: 'success' },
        { id: 'confirm', label: 'Payment Confirmed', status: 'success', message: `TxID: ${txId.substring(0, 8)}...` },
        { id: 'run', label: 'Running AI Skill', status: 'loading' }
      ];
      setProgressSteps([...currentSteps]);

      const data = await executeSkillWithPayment(skill.id, input, txId, fileData);
      
      if (data.success && data.result) {
        currentSteps = [
          ...currentSteps.slice(0, 4),
          { id: 'run', label: 'Skill Executed Successfully', status: 'success' }
        ];
        setProgressSteps([...currentSteps]);
        
        const receipt = {
          success: true,
          skillName: skill.name,
          result: data.result,
          price: skill.price,
          currency: data.payment?.currency || 'USDC',
          network: data.payment?.network || 'Algorand TestNet',
          transactionId: txId,
          explorerUrl: data.explorerUrl || `https://testnet.explorer.perawallet.app/tx/${txId}`,
        };
        setResultData(receipt);
        onToast(`Payment of $${skill.price} USDC settled on-chain for ${skill.name}!`);
      } else {
        currentSteps = [
          ...currentSteps.slice(0, 4),
          { id: 'run', label: 'Execution Failed', status: 'error', message: data.error }
        ];
        setProgressSteps([...currentSteps]);
        setError(data.error || 'Skill execution failed');
      }

    } catch (err) {
       console.error(err);
       setError("An unexpected error occurred.");
    } finally {
       setLoading(false);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
      return;
    }

    if (!input.trim()) return;

    return handleWalletPaymentFlow();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="x402-badge">
              <ShieldCheck size={14} /> {isConnected ? "Pera Wallet Payment" : "x402 Protocol Active"}
            </span>
            <h3>{isConnected ? "Wallet Payment Required" : "x402 Payment Required"}</h3>
          </div>
          <button className="modal-close" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Skill Summary Banner */}
        <div className="modal-skill-banner">
          <div className="skill-meta">
            <span className="skill-icon-large">
              {getCategoryIcon(skill.category)}
            </span>
            <div>
              <h4>{skill.name}</h4>
              <p>{skill.description}</p>
            </div>
          </div>
          <div className="skill-price-tag">
            <span className="price-amount">${typeof skill.price === 'number' ? skill.price.toFixed(2) : skill.price}</span>
            <small>USDC / run</small>
          </div>
        </div>

        {/* Confirmation & Data Input Area */}
        {!resultData && (
          <div className="modal-body">
            <div className="x402-notice">
              <Wallet size={16} className="notice-icon" />
              <span>
                By confirming, <b>${typeof skill.price === 'number' ? skill.price.toFixed(2) : skill.price} USDC</b> testnet currency will be deducted from {isConnected ? "your wallet" : "the payer wallet"} and transferred to the skill receiver address on Algorand TestNet.
              </span>
            </div>

            <div className="input-header">
              <label>Skill Input Specification</label>
              {SAMPLE_INPUTS[skill.slug || skill.id] && (
                <button type="button" className="btn-sample" onClick={loadSample} disabled={loading}>
                  <Sparkles size={13} /> Load Sample Input
                </button>
              )}
            </div>

            <textarea
              className="skill-input-area"
              rows={8}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter prompt or details for ${skill.name}...`}
              disabled={loading}
              style={{ padding: '16px', fontSize: '15px', lineHeight: '1.6' }}
            />

            <div className="file-upload-container" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="skill-file-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px' }}>
                <Upload size={14} /> {fileName ? 'Change File' : 'Upload File (PDF, DOCX, PNG)'}
              </label>
              <input
                id="skill-file-upload"
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={loading}
                style={{ display: 'none' }}
              />
              {fileName && <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> {fileName}</span>}
            </div>

            {/* Execution Steps Progress Indicator */}
            {loading && !isConnected && (
              <div className="execution-pipeline">
                <h5>
                  <Cpu size={14} className="spin-pulse" /> Live x402 Settlement & Execution Pipeline
                </h5>
                <div className="pipeline-steps">
                  <div className={`step-item ${executionStep >= 1 ? 'active' : ''}`}>
                    <span>1. Requesting skill endpoint (/api/execute/{skill.id})</span>
                    {executionStep === 1 && <Loader2 size={13} className="spin" />}
                    {executionStep > 1 && <span className="check">✓ Sent</span>}
                  </div>
                  <div className={`step-item ${executionStep >= 2 ? 'active' : ''}`}>
                    <span>2. HTTP 402 Payment Required (${skill.price} USDC on Algorand)</span>
                    {executionStep === 2 && <Loader2 size={13} className="spin" />}
                    {executionStep > 2 && <span className="check">✓ 402 Handled</span>}
                  </div>
                  <div className={`step-item ${executionStep >= 3 ? 'active' : ''}`}>
                    <span>3. Signing & Settling USDC Payment on Algorand TestNet</span>
                    {executionStep === 3 && <Loader2 size={13} className="spin" />}
                    {executionStep > 3 && <span className="check">✓ Settled</span>}
                  </div>
                  <div className={`step-item ${executionStep >= 4 ? 'active' : ''}`}>
                    <span>4. Running AI Skill (Google Gemini gemini-3.6-flash)</span>
                    {executionStep === 4 && <Loader2 size={13} className="spin" />}
                    {executionStep > 4 && <span className="check">✓ Completed</span>}
                  </div>
                </div>
              </div>
            )}
            
            {loading && isConnected && (
              <div className="execution-pipeline">
                <h5>
                  <Wallet size={14} className="spin-pulse" /> Wallet Payment & Execution Pipeline
                </h5>
                <TransactionProgress steps={progressSteps} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="modal-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Success / Result View */}
        {resultData && (
          <div className="modal-result-body">
            <div className="settlement-receipt">
              <div className="receipt-head">
                <CheckCircle2 size={20} className="receipt-check" />
                <div>
                  <h5>Payment Confirmed & Settled On-Chain</h5>
                  <p>Settlement verified {isConnected ? "via Wallet" : "via x402 Protocol"} on Algorand TestNet</p>
                </div>
              </div>
              <div className="receipt-details">
                <div>
                  <small>Amount Deducted:</small>
                  <b>${resultData.price} USDC</b>
                </div>
                <div>
                  <small>Network:</small>
                  <span>{resultData.network}</span>
                </div>
                <div>
                  <small>Transaction Hash:</small>
                  <a href={resultData.explorerUrl} target="_blank" rel="noreferrer" className="tx-link">
                    {resultData.transactionId.substring(0, 16)}... <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div className="output-container">
              <div className="output-head">
                <Sparkles size={15} /> <span>{skill.name} Result</span>
              </div>
              <div className="output-content markdown-body" style={{ whiteSpace: 'normal', lineHeight: '1.6', fontSize: '15px', fontFamily: 'Inter, sans-serif', overflowY: 'auto', maxHeight: '55vh', padding: '16px', background: '#0a0d16', borderRadius: '12px', border: '1px solid #1c2436' }}>
                <ReactMarkdown>{resultData.result.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="modal-footer">
          {!resultData ? (
            <>
              <button className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                className="btn-confirm-pay"
                onClick={handleConfirmAndPay}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    {isConnected ? "Pay via Pera Wallet " : "Connect Wallet to Pay "}${typeof skill.price === 'number' ? skill.price.toFixed(2) : skill.price} USDC <ArrowRight size={15} />
                  </>
                )}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Download Report
              </button>
              <button className="btn-confirm-pay" onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
