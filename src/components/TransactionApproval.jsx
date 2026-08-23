import React from 'react';
import { X, ArrowUpRight, ShieldCheck, Fuel, AlertCircle, CheckCircle2 } from 'lucide-react';
import { shortenAddress } from '../utils/address';
import { formatEth, formatUsdValue } from '../utils/format';
import { PRIMARY_NETWORK } from '../config/networks';

export const TransactionApproval = ({
  isOpen,
  onClose,
  onConfirm,
  recipient,
  amountEth,
  smartWalletAddress,
  connectedEOA,
  gasEstimate,
  isOwnerConnected
}) => {
  if (!isOpen) return null;

  const usdValue = formatUsdValue(amountEth);
  const estimatedGasEth = gasEstimate?.estimatedCostWei ? formatEth(gasEstimate.estimatedCostWei, 6) : '0.000225';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow p-6 border border-cyan-500/30 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Transaction Approval</h3>
              <p className="text-xs text-gray-400">Review Smart Wallet execution details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ownership Warning if non-owner connected */}
        {!isOwnerConnected && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p>
              <strong>Warning:</strong> Your connected EOA is not the registered owner of this Smart Contract Wallet. Execution may revert.
            </p>
          </div>
        )}

        {/* Transaction Summary Breakdown */}
        <div className="bg-[#0B0F19]/80 rounded-xl p-4 border border-white/5 space-y-3 text-xs">
          
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-gray-400">Action</span>
            <span className="font-semibold text-cyan-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Send ETH
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">From (Smart Wallet)</span>
            <span className="font-mono font-medium text-white">
              {shortenAddress(smartWalletAddress, 6)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Recipient (To)</span>
            <span className="font-mono font-medium text-cyan-300">
              {shortenAddress(recipient, 6)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-gray-400">Amount</span>
            <div className="text-right">
              <span className="font-bold text-white font-mono text-sm block">
                {amountEth} ETH
              </span>
              <span className="text-[11px] text-gray-400 block">
                ≈ {usdValue}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-gray-400 flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              Est. Network Fee
            </span>
            <span className="font-mono text-gray-300">
              ~{estimatedGasEth} ETH
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-gray-400">Connected Signer EOA</span>
            <span className="font-mono text-purple-300">
              {shortenAddress(connectedEOA, 6)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-gray-400">Network</span>
            <span className="font-semibold text-emerald-400">
              {PRIMARY_NETWORK.name}
            </span>
          </div>
        </div>

        {/* Execution Mechanism Explanation */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 leading-relaxed">
          <strong>Single-Sign Flow:</strong> Clicking <em>Approve & Send</em> will prompt your connected EOA to sign and invoke <code className="font-mono text-blue-200">SmartWallet.execute()</code>.
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Reject
          </button>
          <button
            onClick={onConfirm}
            className="gradient-button px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Send
          </button>
        </div>
      </div>
    </div>
  );
};
