import React from 'react';
import { ArrowRight, Play, Check, Zap } from 'lucide-react';
import heroImg from '../../agenthub-hero.webp';

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot"></span> Pay-per-use AI, no subscriptions
        </div>
        <h1>
          Don’t pay for an AI.<br />
          <em>Pay only</em> for the<br />
          skill you use.
        </h1>
        <p>
          Compose powerful AI workflows from modular, pay-per-use skills. Execute instantly, track costs in real time, and only pay for what you actually run.
        </p>
        <div className="hero-buttons">
          <button className="primary" onClick={() => scrollTo('marketplace')}>
            Explore the Marketplace <ArrowRight size={17} />
          </button>
          <button className="ghost" onClick={() => scrollTo('agent')}>
            <Play size={14} fill="currentColor" /> See Agent Mode
          </button>
        </div>
        <div className="hero-proof">
          <div className="avatars">
            <i>NL</i>
            <i>0M</i>
            <i>LS</i>
            <i>+</i>
          </div>
          <span><b>24k+</b> skills executed this week</span>
        </div>
      </div>

      <div className="hero-art">
        <img src={heroImg} alt="AgentEra Mesh Network" />
        <div className="float-card cost">
          <span className="mini-icon green">
            <Check size={13} />
          </span>
          <div>
            <small>Workflow complete</small>
            <b>$0.85 total cost</b>
          </div>
        </div>
        <div className="float-card node">
          <span className="mini-icon purple">
            <Zap size={13} />
          </span>
          <div>
            <small>Agent Mode</small>
            <b>3 skills connected</b>
          </div>
        </div>
        <div className="orbit o1"></div>
        <div className="orbit o2"></div>
      </div>
    </section>
  );
}
