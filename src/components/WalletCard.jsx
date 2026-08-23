import React, { useState } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, ArrowUpRight, ArrowDownLeft, ShieldCheck, KeyRound } from 'lucide-react';
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
  ownerAddress
}) => {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedEOA, setCopiedEOA] = useState(false);

  const handleCopyContract = () => {
    if (!smartWalletAddress) return;
    navigator.clipboard.writeText(smartWalletAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyEOA = () => {
    if (!connectedEOA) return;
    navigator.clipboard.writeText(connectedEOA);
    setCopiedEOA(true);
    setTimeout(() => setCopiedEOA(false), 2000);
  };

  const formattedBalance = formatEth(balance);
  const usdValue = formatUsdValue(formattedBalance);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Account Info Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        
        {/* Smart Contract Wallet Address Badge */}
        <div className="flex items-center gap-2 bg-[#0B0F19]/80 px-3 py-1.5 rounded-xl border border-white/5 text-xs">
          <span className="text-gray-400 text-[11px] font-medium">Smart Wallet:</span>
          <span className="font-mono text-cyan-300 font-semibold">
            {shortenAddress(smartWalletAddress, 5)}
          </span>
          <button onClick={handleCopyContract} className="text-gray-400 hover:text-white transition-colors cursor-pointer" title="Copy Address">
            {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWalletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
            title="View on Etherscan"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Connected Signer Badge */}
        {connectedEOA && (
          <div className="flex items-center gap-2 bg-[#0B0F19]/80 px-3 py-1.5 rounded-xl border border-white/5 text-xs">
            <span className={`w-2 h-2 rounded-full ${isOwnerConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-gray-400 text-[11px]">Signer EOA:</span>
            <span className="font-mono text-gray-200 font-semibold">
              {shortenAddress(connectedEOA, 4)}
            </span>
            <button onClick={handleCopyEOA} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              {copiedEOA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Balance Display */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-2 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Total Smart Wallet Balance
        </span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
            {isLoading ? '...' : formattedBalance}
          </span>
          <span className="text-xl font-bold text-cyan-400">ETH</span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer ml-1"
            title="Refresh Balance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
        <span className="text-xs text-gray-400 font-medium">
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
          className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Receive ETH
        </button>
      </div>
    </div>
  );
};
