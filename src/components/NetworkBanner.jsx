import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { PRIMARY_NETWORK } from '../config/networks';

export const NetworkBanner = ({ isConnected, isCorrectNetwork, currentNetwork, onSwitchNetwork }) => {
  if (!isConnected || isCorrectNetwork) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-amber-300">Wrong Network Detected</span>
            <span className="hidden sm:inline mx-2">•</span>
            <span className="block sm:inline text-amber-200/80">
              Your wallet is on <strong className="text-amber-200">{currentNetwork?.name || 'an unsupported network'}</strong>. Please switch to <strong className="text-amber-200">{PRIMARY_NETWORK.name}</strong> to interact with the Smart Contract Wallet.
            </span>
          </div>
        </div>
        <button
          onClick={onSwitchNetwork}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors shadow-sm text-xs cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Switch to {PRIMARY_NETWORK.shortName}
        </button>
      </div>
    </div>
  );
};
