import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CreatorCTA({ onToast }) {
  const handleClick = () => {
    onToast('Creator application opened');
  };

  return (
    <section id="creators" className="creator-cta">
      <div>
        <div className="eyebrow">FOR SKILL CREATORS</div>
        <h2>
          Build once.<br />
          <span>Earn every run.</span>
        </h2>
      </div>
      <p>Publish a single skill, set your price, and earn a royalty on every run. No SaaS to build, no infra to run.</p>
      <button className="light-btn" onClick={handleClick}>
        Become a creator <ArrowRight size={16} />
      </button>
    </section>
  );
}
