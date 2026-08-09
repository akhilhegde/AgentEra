import React, { useState } from 'react';
import { Sparkles, WalletCards, Menu, X } from 'lucide-react';

export default function Header({ onToast }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleWalletClick = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      onToast('Wallet connected (0x71...A42)');
    } else {
      setWalletConnected(false);
      onToast('Wallet disconnected');
    }
  };

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header>
      <a className="brand" href="#top">
        <span className="brandmark">
          <Sparkles size={15} />
        </span>
        AGENT<span>ERA</span>
      </a>

      <nav className={menuOpen ? 'open' : ''}>
        <button onClick={() => scrollToSection('marketplace')}>Marketplace</button>
        <button onClick={() => scrollToSection('agent')}>Agent Mode</button>
        <button onClick={() => scrollToSection('creators')}>Creators</button>
      </nav>

      <div className="nav-actions">
        <button className="wallet" onClick={handleWalletClick}>
          <WalletCards size={16} />
          {walletConnected ? '0x71...A42' : 'Connect wallet'}
        </button>
        <button className="hamb" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
