import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, visible }) {
  if (!visible) return null;

  return (
    <div className="toast">
      <CheckCircle2 size={16} />
      <span>{message}</span>
    </div>
  );
}
