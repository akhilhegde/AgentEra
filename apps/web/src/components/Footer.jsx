import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="brand">
        <span className="brandmark">
          <Sparkles size={15} />
        </span>
        AGENT<span>ERA</span>
      </div>
      <p>Infrastructure for the agent economy.</p>
      <div className="footer-links">
        <a href="#marketplace" onClick={(e) => { e.preventDefault(); scrollTo('marketplace'); }}>Marketplace</a>
        <a href="#agent" onClick={(e) => { e.preventDefault(); scrollTo('agent'); }}>Agent Mode</a>
        <a href="#creators" onClick={(e) => { e.preventDefault(); scrollTo('creators'); }}>Creators</a>
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollTo('top'); }}>Docs</a>
        <span>© 2026 AGENTERA · Demo product</span>
      </div>
    </footer>
  );
}
