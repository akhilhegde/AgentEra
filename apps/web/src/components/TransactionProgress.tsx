import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export type TransactionStepStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TransactionStep {
  id: string;
  label: string;
  status: TransactionStepStatus;
  message?: string;
}

interface TransactionProgressProps {
  steps: TransactionStep[];
}

export default function TransactionProgress({ steps }: TransactionProgressProps) {
  return (
    <div className="transaction-progress">
      {steps.map((step) => (
        <div key={step.id} className={`progress-step ${step.status}`}>
          <div className="step-indicator">
            {step.status === 'success' && <CheckCircle2 size={16} className="text-green" />}
            {step.status === 'loading' && <Loader2 size={16} className="spin text-blue" />}
            {step.status === 'error' && <XCircle size={16} className="text-red" />}
            {step.status === 'idle' && <div className="idle-dot" />}
          </div>
          <div className="step-content">
            <div className="step-label">{step.label}</div>
            {step.message && <div className="step-message">{step.message}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
