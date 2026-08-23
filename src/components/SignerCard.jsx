import React, { useState } from 'react';
import { KeyRound, ShieldCheck, ShieldAlert, Copy, Check, Info } from 'lucide-react';
import { shortenAddress } from '../utils/address';

export const SignerCard = ({ connectedEOA, ownerAddress, isOwnerConnected, onConnect }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!connectedEOA) return;
    navigator.clipboard.writeText(connectedEOA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Connected EOA Signer
              </span>
              <h4 className="text-xs text-purple-300 font-mono">
                Authentication & Signer Only
              </h4>
            </div>
          </div>

          {connectedEOA && (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${
                isOwnerConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isOwnerConnected ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Owner
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Signer ≠ Owner
                </>
              )}
            </span>
          )}
        </div>

        {connectedEOA ? (
          <div className="mt-4 bg-[#0B0F19]/60 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Your EOA Address:</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-white">
                {shortenAddress(connectedEOA, 6)}
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <span className="text-gray-400">Smart Wallet Owner:</span>
              <span className="font-mono text-gray-300">
                {ownerAddress ? shortenAddress(ownerAddress, 6) : 'Unassigned / Generic'}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-[#0B0F19]/60 rounded-xl p-4 border border-white/5 text-center">
            <p className="text-xs text-gray-400 mb-3">
              No EOA wallet connected. Connect your MetaMask or injected Web3 provider to sign transactions.
            </p>
            <button
              onClick={onConnect}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-purple-500/20"
            >
              Connect EOA Signer
            </button>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-300/90">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          The EOA holds <strong>no wallet assets</strong>. It is used strictly to produce digital signatures authorizing your Smart Contract Wallet to execute operations.
        </p>
      </div>
    </div>
  );
};
