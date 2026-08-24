import React, { useState } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { shortenAddress } from '../utils/address';
import { formatEth, formatUsdValue } from '../utils/format';
import { PRIMARY_NETWORK } from '../config/networks';

export const WalletCard = ({
  smartWalletAddress,
  balance,
  isLoading,
  onRefresh,
  onNavigate,
  connectedEOA,
  isOwnerConnected,
  ownerAddress,
  onTriggerToast
}) => {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedEOA, setCopiedEOA] = useState(false);

  const handleCopyContract = () => {
    if (!smartWalletAddress) return;
    navigator.clipboard.writeText(smartWalletAddress);
    setCopiedContract(true);
    if (onTriggerToast) {
      onTriggerToast("Smart Wallet Address copied to clipboard!");
    }
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyEOA = () => {
    if (!connectedEOA) return;
    navigator.clipboard.writeText(connectedEOA);
    setCopiedEOA(true);
    if (onTriggerToast) {
      onTriggerToast("EOA Signer Address copied to clipboard!");
    }
    setTimeout(() => setCopiedEOA(false), 2000);
  };

  const formattedBalance = formatEth(balance);
  const usdValue = formatUsdValue(formattedBalance);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl space-y-6">
      
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Account Info Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
        
        {/* Smart Contract Wallet Address Badge */}
        <div className="flex items-center gap-2 bg-[var(--bg-card-subtle)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs">
          <span className="text-[var(--text-secondary)] text-[11px] font-medium">Smart Wallet:</span>
          <span className="font-mono text-cyan-500 font-bold">
            {shortenAddress(smartWalletAddress, 5)}
          </span>
          <button onClick={handleCopyContract} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="Copy Address">
            {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWalletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-cyan-500 transition-colors"
            title="View on Etherscan"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Connected Signer Badge */}
        {connectedEOA && (
          <div className="flex items-center gap-2 bg-[var(--bg-card-subtle)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs">
            <span className={`w-2 h-2 rounded-full ${isOwnerConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[var(--text-secondary)] text-[11px]">Signer EOA:</span>
            <span className="font-mono text-[var(--text-primary)] font-bold">
              {shortenAddress(connectedEOA, 4)}
            </span>
            <button onClick={handleCopyEOA} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
              {copiedEOA ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Balance Display */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-2 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Total Smart Wallet Balance
        </span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight font-mono">
            {isLoading ? '...' : formattedBalance}
          </span>
          <span className="text-xl font-bold text-cyan-500">ETH</span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-1"
            title="Refresh Balance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
        <span className="text-xs text-[var(--text-secondary)] font-medium">
          ≈ {usdValue} USD (Sepolia Testnet)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
        <button
          onClick={() => onNavigate('send')}
          className="gradient-button py-3 px-5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          <ArrowUpRight className="w-4 h-4" />
          Send ETH
        </button>
        <button
          onClick={() => onNavigate('receive')}
          className="py-3 px-5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Receive ETH
        </button>
      </div>
    </div>
  );
};
