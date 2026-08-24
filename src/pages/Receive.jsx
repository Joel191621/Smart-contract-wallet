import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, ShieldAlert, ArrowDownLeft, Wallet } from 'lucide-react';
import { PRIMARY_NETWORK } from '../config/networks';

export const Receive = ({ smartWalletAddress, account, onConnect, onTriggerToast }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!smartWalletAddress) return;
    navigator.clipboard.writeText(smartWalletAddress);
    setCopied(true);
    if (onTriggerToast) {
      onTriggerToast("Smart Wallet Address copied to clipboard!");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 text-center">
        <div className="rounded-3xl glass-panel p-8 border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto">
            <ArrowDownLeft className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              Wallet Disconnected
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
              Connect your EOA Web3 wallet to display your Smart Contract Wallet deposit QR code and address.
            </p>
          </div>

          <button
            onClick={onConnect}
            className="w-full gradient-button py-3.5 px-6 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Wallet className="w-4 h-4" />
            Connect EOA Signer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-2">
          <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          Receive ETH
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Deposit ETH directly into your Smart Contract Wallet
        </p>
      </div>

      {/* Main Receive Card */}
      <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] text-center space-y-5">
        
        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs text-left flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="font-bold block text-amber-500">
              Important: Send ONLY to Smart Contract Wallet
            </strong>
            This is your <strong>Smart Contract Wallet address</strong> on Sepolia. Do NOT send funds to your connected EOA signer address if you intend to deposit into this Smart Wallet.
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-xl max-w-[200px] mx-auto">
          {smartWalletAddress ? (
            <QRCodeSVG
              value={smartWalletAddress}
              size={160}
              level="H"
              includeMargin={true}
            />
          ) : (
            <div className="w-[160px] h-[160px] flex items-center justify-center text-xs text-gray-400 font-mono">
              No Address Configured
            </div>
          )}
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-2">
            Sepolia Smart Wallet Address
          </span>
        </div>

        {/* Address Display & Copy */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--text-secondary)] font-medium block">
            Smart Contract Wallet Address
          </label>
          <div className="bg-[var(--bg-card-subtle)] rounded-xl p-3 border border-[var(--border-color)] flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-cyan-500 font-bold break-all text-left">
              {smartWalletAddress || '0x0000000000000000000000000000000000000000'}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[var(--text-primary)] transition-colors shrink-0 cursor-pointer"
              title="Copy Address"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={handleCopy}
            className="gradient-button px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Address Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Address
              </>
            )}
          </button>

          {smartWalletAddress && (
            <a
              href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWalletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Etherscan
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
