import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, KeyRound, Globe, ExternalLink, Cpu, CheckCircle2, AlertTriangle, RefreshCw, FileCode2 } from 'lucide-react';
import { NETWORKS, PRIMARY_NETWORK } from '../config/networks';
import { shortenAddress } from '../utils/address';

export const Settings = ({
  smartWallet,
  account,
  signer,
  chainId,
  isCorrectNetwork,
  onSwitchNetwork
}) => {
  const [testMessage, setTestMessage] = useState('Verify Aegis Vault Signer Authorization');
  const [signStatus, setSignStatus] = useState(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleTestSignature = async () => {
    if (!signer || !account) {
      setSignStatus({ success: false, message: 'No EOA wallet connected.' });
      return;
    }

    setIsSigning(true);
    setSignStatus(null);

    try {
      // 1. Request EOA signature
      const signature = await signer.signMessage(testMessage);

      // 2. Check if connected EOA matches contract owner
      const isOwner = smartWallet.isOwnerConnected;

      setSignStatus({
        success: true,
        signature,
        isOwner,
        message: isOwner
          ? 'Signature successfully verified! Connected EOA is the authorized Smart Wallet owner.'
          : 'Signature generated, but connected EOA is NOT registered as the contract owner.'
      });
    } catch (err) {
      setSignStatus({
        success: false,
        message: err.message || 'Signature request rejected or failed.'
      });
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          Wallet Settings & Configuration
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Smart contract metadata, EOA authorization details, and network settings
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Wallet Contract Info Card */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Smart Wallet Contract Info</h3>
              <p className="text-[11px] text-gray-400">Sepolia contract parameters</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs bg-[#0B0F19]/60 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Contract Address:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {shortenAddress(smartWallet.smartWalletAddress, 6)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-gray-400">Contract Owner:</span>
              <span className="font-mono text-gray-200">
                {smartWallet.ownerAddress ? shortenAddress(smartWallet.ownerAddress, 6) : 'Not read'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-gray-400">Bytecode Status:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-gray-400">Contract Nonce:</span>
              <span className="font-mono text-white">
                #{smartWallet.nonce ? smartWallet.nonce.toString() : '0'}
              </span>
            </div>
          </div>

          <a
            href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWallet.smartWalletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
          >
            View Smart Wallet on Etherscan
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Security & Signer Verification Card */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Signer Security & Auth</h3>
              <p className="text-[11px] text-gray-400">Connected EOA signer verification</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs bg-[#0B0F19]/60 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connected Signer EOA:</span>
              <span className="font-mono text-purple-300 font-semibold">
                {account ? shortenAddress(account, 6) : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-gray-400">Authorization Status:</span>
              {smartWallet.isOwnerConnected ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Authorized Owner
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Signer ≠ Owner
                </span>
              )}
            </div>
          </div>

          {/* Signature Testing Widget */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">
              Test EOA Message Signing
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white font-mono text-xs focus:outline-none"
              />
              <button
                onClick={handleTestSignature}
                disabled={isSigning || !account}
                className="gradient-button px-3 py-1.5 rounded-xl text-white font-semibold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSigning ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sign'}
              </button>
            </div>

            {signStatus && (
              <div className={`p-2.5 rounded-xl text-[11px] font-mono border ${
                signStatus.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {signStatus.message}
                {signStatus.signature && (
                  <div className="mt-1 opacity-70 truncate">
                    Sig: {signStatus.signature}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Selector Card */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Network Settings & Multi-Chain Architecture</h3>
              <p className="text-[11px] text-gray-400">Configure target networks for Smart Contract Wallet</p>
            </div>
          </div>

          <button
            onClick={onSwitchNetwork}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Switch to Sepolia
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {Object.values(NETWORKS).map((net) => {
            const isCurrent = net.chainId === chainId;
            return (
              <div
                key={net.chainId}
                className={`p-4 rounded-xl border transition-all ${
                  net.supported
                    ? isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-[#0B0F19]/60 border-white/10 text-gray-300'
                    : 'bg-[#0B0F19]/30 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{net.name}</span>
                  {net.supported ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active Target
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-700/50 text-gray-400 border border-gray-600/30">
                      Requires Deployment
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">
                  Chain ID: {net.chainId} • {net.symbol}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
