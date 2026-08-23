import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, ArrowUpRight, Copy, Check } from 'lucide-react';
import { PRIMARY_NETWORK } from '../config/networks';
import { shortenAddress } from '../utils/address';
import { formatUsdValue } from '../utils/format';

export const TransactionStatusModal = ({ txState, onClose, onTryAgain }) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTo, setCopiedTo] = useState(false);

  if (!txState || txState.status === 'idle') return null;

  const { status, hash, blockNumber, message, errorDetails, recipient, amountEth, smartWalletAddress } = txState;

  const isPending = ['preparing', 'waiting_signature', 'submitting', 'pending'].includes(status);
  const isConfirmed = status === 'confirmed';
  const isFailed = status === 'failed' || status === 'rejected';

  const handleCopyHash = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyRecipient = () => {
    if (!recipient) return;
    navigator.clipboard.writeText(recipient);
    setCopiedTo(true);
    setTimeout(() => setCopiedTo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6 text-center">
        
        {/* Status Graphic / Icon */}
        <div className="flex justify-center">
          {isPending && (
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/20 animate-ping" />
            </div>
          )}

          {isConfirmed && (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          {isFailed && (
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/20">
              {status === 'rejected' ? <AlertTriangle className="w-10 h-10 text-amber-400" /> : <XCircle className="w-10 h-10" />}
            </div>
          )}
        </div>

        {/* Status Header */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tight">
            {status === 'preparing' && 'Preparing Transaction'}
            {status === 'waiting_signature' && 'Waiting for Signature'}
            {status === 'submitting' && 'Submitting to Sepolia'}
            {status === 'pending' && 'Transaction Mining'}
            {status === 'confirmed' && 'Transaction Successfully Completed! 🎉'}
            {status === 'rejected' && 'Signature Rejected'}
            {status === 'failed' && 'Transaction Failed'}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Success Completion Details Breakdown Card */}
        {isConfirmed && (
          <div className="bg-[#0B0F19]/90 rounded-2xl p-4 border border-emerald-500/30 text-xs text-left space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Transferred Amount</span>
              <div className="text-right">
                <span className="font-mono font-black text-emerald-400 text-sm block">
                  {amountEth} ETH
                </span>
                {amountEth && (
                  <span className="text-[10px] text-gray-400 block font-mono">
                    ≈ {formatUsdValue(amountEth)} USD
                  </span>
                )}
              </div>
            </div>

            {smartWalletAddress && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">From Smart Wallet</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {shortenAddress(smartWalletAddress, 5)}
                </span>
              </div>
            )}

            {recipient && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Recipient Address</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-white font-semibold">
                    {shortenAddress(recipient, 5)}
                  </span>
                  <button onClick={handleCopyRecipient} className="p-0.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {copiedTo ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}

            {hash && (
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-gray-400">Transaction Hash</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-cyan-400">
                    {shortenAddress(hash, 5)}
                  </span>
                  <button onClick={handleCopyHash} className="p-0.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}

            {blockNumber && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Confirmed Block</span>
                <span className="font-mono text-gray-200">#{blockNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Tracker Steps for Pending State */}
        {isPending && (
          <div className="bg-[#0B0F19]/80 rounded-2xl p-4 border border-white/5 space-y-2 text-xs text-left">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                status === 'preparing' ? 'bg-cyan-500 text-black animate-pulse' : 'bg-emerald-500 text-black'
              }`}>
                1
              </div>
              <span className={status === 'preparing' ? 'text-cyan-300 font-semibold' : 'text-gray-300'}>
                Prepare Smart Wallet Execution
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                status === 'waiting_signature' ? 'bg-cyan-500 text-black animate-pulse' : ['submitting', 'pending', 'confirmed'].includes(status) ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <span className={status === 'waiting_signature' ? 'text-cyan-300 font-semibold' : ['submitting', 'pending', 'confirmed'].includes(status) ? 'text-gray-300' : 'text-gray-500'}>
                EOA Signature Authorization
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                ['submitting', 'pending'].includes(status) ? 'bg-cyan-500 text-black animate-pulse' : status === 'confirmed' ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-400'
              }`}>
                3
              </div>
              <span className={['submitting', 'pending'].includes(status) ? 'text-cyan-300 font-semibold' : status === 'confirmed' ? 'text-gray-300' : 'text-gray-500'}>
                On-Chain Mining on Sepolia
              </span>
            </div>
          </div>
        )}

        {/* Etherscan Button */}
        {hash && (
          <a
            href={`${PRIMARY_NETWORK.explorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-400 transition-colors"
          >
            View on Sepolia Etherscan
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Error Details if Failed */}
        {errorDetails && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 font-mono text-left overflow-x-auto max-h-24">
            <strong>Error Details:</strong> {errorDetails}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2">
          {isConfirmed && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Done & Close
            </button>
          )}

          {isFailed && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={onTryAgain}
                className="py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
