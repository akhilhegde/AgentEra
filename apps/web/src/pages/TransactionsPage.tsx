import React, { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet.store';
import { fetchTransactions, type Transaction } from '../services/api';
import { connectWallet } from '../services/peraWallet';
import { History, Loader2, ArrowRight, ShieldCheck, Receipt } from 'lucide-react';
import TransactionDetailsModal from '../components/TransactionDetailsModal';

const TransactionsPage: React.FC = () => {
  const { isConnected, address, usdcBalance } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadHistory = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(address);
      const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(sorted);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadHistory();
    } else {
      setTransactions([]);
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <section className="section tx-page-empty">
        <div className="tx-empty-icon">
          <History size={40} />
        </div>
        <h2>Transaction History</h2>
        <p>Connect your Pera Wallet to view your past AgentHub payments securely retrieved from the Algorand TestNet blockchain.</p>
        <button onClick={() => connectWallet()} className="glow-btn">
          Connect Wallet to View History
        </button>
      </section>
    );
  }

  return (
    <section className="section tx-page">
      <div className="section-head">
        <div>
          <div className="eyebrow">YOUR ACTIVITY</div>
          <h2>
            Transaction <br />
            <span>History</span>
          </h2>
        </div>
        <p>Your on-chain AgentHub payments on Algorand TestNet.</p>
      </div>

      <div className="tx-stats">
        <div>
          <small>WALLET</small>
          <b>{address?.slice(0, 8)}...{address?.slice(-8)}</b>
        </div>
        <div>
          <small>USDC BALANCE</small>
          <b className="usdc-balance">{usdcBalance || '0.00'}</b>
        </div>
        <button onClick={loadHistory} disabled={loading} className="refresh-btn">
          {loading ? <Loader2 size={14} className="spin" /> : "↻"} Refresh History
        </button>
      </div>

      {error && (
        <div className="tx-error">
          {error}
        </div>
      )}

      <div className="tx-list-container">
        {loading && transactions.length === 0 ? (
          <div className="tx-loading">
            <Loader2 size={30} className="spin" />
            <p>Fetching on-chain records...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="tx-empty-state">
            <Receipt size={32} />
            <h3>No AgentHub transactions yet.</h3>
            <p>Run an AI skill from the marketplace to see your payments here.</p>
            <a href="#marketplace">Browse Skills <ArrowRight size={14} /></a>
          </div>
        ) : (
          <div className="tx-list">
            <div className="tx-header">
              <div className="tx-col-skill">Skill</div>
              <div className="tx-col-amount">Amount</div>
              <div className="tx-col-date">Date</div>
              <div className="tx-col-status">Status</div>
              <div className="tx-col-action"></div>
            </div>
            
            {transactions.map((tx) => (
              <div 
                key={tx.txId} 
                onClick={() => setSelectedTx(tx)}
                className="tx-row"
              >
                <div className="tx-col-skill">
                  <div className="tx-icon">
                    <Receipt size={16} />
                  </div>
                  <div className="tx-skill-info">
                    <b>{tx.skillName}</b>
                    <small>{tx.category}</small>
                  </div>
                </div>
                
                <div className="tx-col-amount">
                  <b>${tx.amount}</b>
                  <small>USDC</small>
                </div>
                
                <div className="tx-col-date">
                  <div className="tx-date-main">
                    {new Date(tx.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <small>
                    {new Date(tx.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
                
                <div className="tx-col-status">
                  <span className="tx-status-badge">
                    <ShieldCheck size={12} /> {tx.status}
                  </span>
                </div>
                
                <div className="tx-col-action">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTx && (
        <TransactionDetailsModal 
          transaction={selectedTx} 
          onClose={() => setSelectedTx(null)} 
        />
      )}
    </section>
  );
};

export default TransactionsPage;
