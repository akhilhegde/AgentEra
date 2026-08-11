import React from 'react';
import { X, ExternalLink, Calendar, Wallet, Layers3, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../services/api';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, onClose }) => {
  const getExplorerUrl = (txId: string) => `https://testnet.explorer.perawallet.app/tx/${txId}`;

  return (
    <div className="tx-modal-overlay">
      <div className="tx-modal">
        <div className="tx-modal-header">
          <h2>Transaction Details</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="tx-modal-body">
          <div className="tx-modal-amount-row">
            <div className="tx-modal-skill">
              <div className="icon">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3>{transaction.skillName}</h3>
                <p>{transaction.category}</p>
              </div>
            </div>
            <div className="amount">
              <b>${transaction.amount}</b>
              <small>USDC</small>
            </div>
          </div>

          <div className="tx-modal-details">
            <div className="tx-modal-row">
              <label><Calendar size={14} /> Date</label>
              <span>
                {new Date(transaction.timestamp).toLocaleString(undefined, { 
                  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            </div>
            <div className="tx-modal-row">
              <label><Layers3 size={14} /> Status</label>
              <span className="tx-status-badge">
                {transaction.status}
              </span>
            </div>
            <div className="tx-modal-row">
              <label><Layers3 size={14} /> Network</label>
              <span>{transaction.network}</span>
            </div>
          </div>

          <div className="tx-modal-addresses">
            <h4>Addresses</h4>
            <div className="tx-modal-details">
              <div className="tx-modal-row">
                <label><Wallet size={14} /> From</label>
                <span>{transaction.from.slice(0,6)}...{transaction.from.slice(-4)}</span>
              </div>
              <div className="tx-modal-row">
                <label><Wallet size={14} /> To</label>
                <span>{transaction.to.slice(0,6)}...{transaction.to.slice(-4)}</span>
              </div>
            </div>
          </div>

          <div className="tx-modal-txid">
            <h4>Transaction ID</h4>
            <div className="box">
              {transaction.txId}
            </div>
          </div>
        </div>

        <div className="tx-modal-footer">
          <a
            href={getExplorerUrl(transaction.txId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Algorand Explorer <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
