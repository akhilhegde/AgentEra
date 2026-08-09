import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Clock3, ArrowRight, Check } from 'lucide-react';

export default function AgentMode({ onToast }) {
  const [prompt, setPrompt] = useState('');
  const [viewState, setViewState] = useState('input'); // 'input' | 'generated' | 'executing' | 'complete'
  const [activeStep, setActiveStep] = useState(0);

  const samplePrompt = 'Research the creator economy and turn it into a launch brief...';

  const handleTryExample = () => {
    setPrompt(samplePrompt);
  };

  const handleGenerateWorkflow = () => {
    if (!prompt.trim()) return;
    setViewState('generated');
    setActiveStep(0);
    onToast('Generated 3-step workflow plan ($0.85 est. cost)');
  };

  const handleExecuteWorkflow = () => {
    setViewState('executing');
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
    }, 1000);

    setTimeout(() => {
      setActiveStep(3);
    }, 2000);

    setTimeout(() => {
      setViewState('complete');
      onToast('Workflow execution complete!');
    }, 2500);
  };

  const handleStartOver = () => {
    setViewState('input');
    setPrompt('');
    setActiveStep(0);
  };

  return (
    <section id="agent" className="agent-section">
      <div className="agent-intro">
        <div className="eyebrow">
          <Sparkles size={14} /> AGENT MODE
        </div>
        <h2>
          Give it a goal.<br />
          <em>Get a workflow.</em>
        </h2>
        <p>
          Agent Mode finds the right skills, maps the steps, and shows you exactly what it will cost before anything runs.
        </p>

        <div className="trust-list">
          <span>
            <ShieldCheck size={16} /> Transparent by default
          </span>
          <span>
            <Clock3 size={16} /> Live execution tracking
          </span>
        </div>
      </div>

      <div className="agent-panel">
        <div className="panel-top">
          <span className="live-dot"></span>
          <span>
            {viewState === 'input' && 'WHAT DO YOU WANT TO DO?'}
            {viewState === 'generated' && 'WORKFLOW PLAN'}
            {(viewState === 'executing' || viewState === 'complete') && 'EXECUTING WORKFLOW'}
          </span>
          <span className="demo">DEMO MODE</span>
        </div>

        {viewState === 'input' && (
          <>
            <textarea
              placeholder="e.g. Research the creator economy and turn it into a launch brief..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
            <button className="example" onClick={handleTryExample}>
              Try an example <ArrowRight size={14} />
            </button>
            <button
              className="primary wide"
              disabled={!prompt.trim()}
              onClick={handleGenerateWorkflow}
            >
              Generate workflow <Sparkles size={16} />
            </button>
          </>
        )}

        {(viewState === 'generated' || viewState === 'executing' || viewState === 'complete') && (
          <>
            <div className="goal-row">
              <span>GOAL</span>
              <b>{prompt}</b>
            </div>

            <div className="steps">
              <div
                className={`step ${
                  activeStep >= 1 ? 'done' : viewState === 'generated' ? 'current' : ''
                }`}
              >
                <div className="step-num">{activeStep >= 1 ? <Check size={13} /> : '1'}</div>
                <div>
                  <b>Deep Research</b>
                  <p>Scan sources + extract key signals</p>
                </div>
                <strong>$0.42</strong>
              </div>

              <div
                className={`step ${
                  activeStep >= 2 ? 'done' : activeStep === 1 ? 'current' : ''
                }`}
              >
                <div className="step-num">{activeStep >= 2 ? <Check size={13} /> : '2'}</div>
                <div>
                  <b>Signal Scout</b>
                  <p>Cross-check market momentum</p>
                </div>
                <strong>$0.18</strong>
              </div>

              <div
                className={`step ${
                  activeStep >= 3 ? 'done' : activeStep === 2 ? 'current' : ''
                }`}
              >
                <div className="step-num">{activeStep >= 3 ? <Check size={13} /> : '3'}</div>
                <div>
                  <b>Brand Voice Kit</b>
                  <p>Package findings into a sharp brief</p>
                </div>
                <strong>$0.25</strong>
              </div>
            </div>

            <div className="total">
              <div>
                Estimated total <small>· pay per run</small>
              </div>
              <b>$0.85</b>
            </div>

            {viewState === 'generated' && (
              <button className="primary wide" onClick={handleExecuteWorkflow}>
                <ArrowRight size={16} /> Execute workflow
              </button>
            )}

            {viewState === 'complete' && (
              <div className="report">
                <Check size={16} />
                <span>Workflow complete — your launch brief is ready.</span>
              </div>
            )}

            <button className="reset" onClick={handleStartOver}>
              ← Start over
            </button>
          </>
        )}
      </div>
    </section>
  );
}
