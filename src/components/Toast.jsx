import React from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

export const Toast = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-toast">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/20 border border-emerald-400">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-950" />
        <span>{message}</span>
      </div>
    </div>
  );
};
