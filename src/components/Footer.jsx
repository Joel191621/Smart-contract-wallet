import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-main)] py-4 px-4 mt-auto transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>Vault Sentinel</span>
        </div>
        <span className="text-[11px]">© {new Date().getFullYear()} Vault Sentinel. All rights reserved.</span>
      </div>
    </footer>
  );
};
