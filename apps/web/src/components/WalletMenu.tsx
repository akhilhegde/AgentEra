import React from 'react';
import { LogOut, Copy, ExternalLink } from 'lucide-react';
import { useWalletStore } from '../stores/wallet.store';
import { disconnectWallet } from '../services/peraWallet';
import { optInToUsdc } from '../services/transactions';

interface WalletMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletMenu({ isOpen, onClose }: WalletMenuProps) {
  const { address, network, algoBalance, usdcBalance, hasUsdcOptIn } = useWalletStore();
  const [isOptingIn, setIsOptingIn] = React.useState(false);

  if (!isOpen || !address) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onClose();
  };

  const handleOptIn = async () => {
    if (parseFloat(algoBalance || '0') < 0.101) {
      alert("You need at least 0.101 ALGO to opt into USDC (0.1 for minimum balance requirement + 0.001 for transaction fee). Please fund your wallet using the TestNet faucet first.");
      return;
    }
    
    setIsOptingIn(true);
    try {
      await optInToUsdc(address);
      useWalletStore.getState().setBalances(algoBalance || "0", usdcBalance || "0", true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to opt into USDC. Did you cancel the transaction in Pera Wallet?");
    } finally {
      setIsOptingIn(false);
    }
  };

  const shortAddress = `${address.slice(0, 8)}...${address.slice(-8)}`;

  return (
    <div className="wallet-menu">
      <div className="wallet-menu-header">
        <div className="network-badge">
          <div className="pulse-dot"></div>
          {network}
        </div>
      </div>
      
      <div className="wallet-menu-body">
        <div className="address-container">
          <span>{shortAddress}</span>
          <button onClick={handleCopy} title="Copy Address" className="icon-btn">
            <Copy size={14} />
          </button>
          <a 
            href={`https://testnet.explorer.perawallet.app/address/${address}`} 
            target="_blank" 
            rel="noreferrer"
            className="icon-btn"
            title="View on Explorer"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="balances">
          <div className="balance-item">
            <div className="balance-label">ALGO</div>
            <div className="balance-value">{algoBalance || '0.00'}</div>
          </div>
          <div className="balance-item">
            <div className="balance-label">USDC</div>
            {hasUsdcOptIn ? (
              <div className="balance-value">{usdcBalance || '0.00'}</div>
            ) : (
              <button 
                className="opt-in-btn" 
                onClick={handleOptIn}
                disabled={isOptingIn}
              >
                {isOptingIn ? 'Enabling...' : 'Enable USDC'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="wallet-menu-footer">
        <button onClick={handleDisconnect} className="disconnect-btn">
          <LogOut size={14} />
          Disconnect
        </button>
      </div>
    </div>
  );
}
