import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, ShieldAlert, ArrowDownLeft, Vault } from 'lucide-react';
import { PRIMARY_NETWORK } from '../config/networks';
import { shortenAddress } from '../utils/address';

export const Receive = ({ smartWalletAddress }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!smartWalletAddress) return;
    navigator.clipboard.writeText(smartWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
          Receive ETH
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Deposit ETH directly into your Smart Contract Wallet
        </p>
      </div>

      {/* Main Receive Card */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 text-center space-y-6">
        
        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-semibold block mb-0.5">
              Important: Send ONLY to Smart Contract Wallet
            </strong>
            This is your <strong>Smart Contract Wallet address</strong> on Sepolia testnet. Assets sent here are controlled by your wallet. Do NOT send funds to your connected EOA signer address if you intend to deposit into this Smart Wallet.
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-2xl max-w-xs mx-auto">
          {smartWalletAddress ? (
            <QRCodeSVG
              value={smartWalletAddress}
              size={180}
              level="H"
              includeMargin={true}
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-gray-400 font-mono">
              No Address Configured
            </div>
          )}
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">
            Sepolia Smart Wallet Address
          </span>
        </div>

        {/* Address Display & Copy */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium block">
            Smart Contract Wallet Address
          </label>
          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-white/10 flex items-center justify-between gap-2 max-w-lg mx-auto">
            <span className="font-mono text-xs sm:text-sm text-cyan-300 font-semibold break-all text-left">
              {smartWalletAddress || '0x0000000000000000000000000000000000000000'}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors shrink-0 cursor-pointer"
              title="Copy Address"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="gradient-button px-5 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Address Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Smart Wallet Address
              </>
            )}
          </button>

          {smartWalletAddress && (
            <a
              href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWalletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Etherscan
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
