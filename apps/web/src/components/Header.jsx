import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, WalletCards, Menu, X } from 'lucide-react';
import { useWalletStore } from '../stores/wallet.store';
import { connectWallet } from '../services/peraWallet';
import WalletMenu from './WalletMenu';

export default function Header({ onToast }) {
  const { isConnected, address, isConnecting } = useWalletStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletRef.current && !walletRef.current.contains(event.target)) {
        setWalletMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWalletClick = async () => {
    if (!isConnected) {
      await connectWallet();
      onToast('Wallet connected');
    } else {
      setWalletMenuOpen(!walletMenuOpen);
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
        <div className="wallet-container" ref={walletRef}>
          <button className="wallet" onClick={handleWalletClick} disabled={isConnecting}>
            <WalletCards size={16} />
            {isConnecting ? 'Connecting...' : (isConnected ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect wallet')}
          </button>
          <WalletMenu isOpen={walletMenuOpen} onClose={() => setWalletMenuOpen(false)} />
        </div>
        <button className="hamb" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
