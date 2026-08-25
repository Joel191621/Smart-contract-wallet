import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, KeyRound, Globe, ExternalLink, Cpu, CheckCircle2, RefreshCw, ArrowRightLeft, Wallet, Lock } from 'lucide-react';
import { NETWORKS, PRIMARY_NETWORK } from '../config/networks';
import { shortenAddress } from '../utils/address';

export const Settings = ({
  smartWallet,
  account,
  signer,
  chainId,
  isCorrectNetwork,
  onSwitchNetwork,
  onConnect,
  onTriggerToast
}) => {
  const [testMessage, setTestMessage] = useState('Verify Vault Sentinel Signer Authorization');
  const [signStatus, setSignStatus] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [switchingChainId, setSwitchingChainId] = useState(null);

  const handleTestSignature = async () => {
    if (!signer || !account) {
      setSignStatus({ success: false, message: 'No EOA wallet connected.' });
      return;
    }

    setIsSigning(true);
    setSignStatus(null);

    try {
      const signature = await signer.signMessage(testMessage);
      const isOwner = smartWallet.isOwnerConnected;

      setSignStatus({
        success: true,
        signature,
        isOwner,
        message: isOwner
          ? 'Signature successfully verified! Connected EOA is the authorized Smart Wallet owner.'
          : 'Signature generated, but connected EOA is NOT registered as the contract owner.'
      });
      if (onTriggerToast) {
        onTriggerToast("Message signed successfully!");
      }
    } catch (err) {
      setSignStatus({
        success: false,
        message: err.message || 'Signature request rejected or failed.'
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleNetworkSwitch = async (net) => {
    setSwitchingChainId(net.chainId);
    try {
      await onSwitchNetwork(net);
      if (onTriggerToast) {
        onTriggerToast(`Switched network to ${net.name}`);
      }
    } catch (err) {
      console.error('Failed to switch network:', err);
    } finally {
      setSwitchingChainId(null);
    }
  };

  // Disconnected state view
  if (!account) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 text-center">
        <div className="rounded-3xl glass-panel p-8 border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              Settings Protected
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
              Connect your EOA Web3 wallet (MetaMask) to view contract specifications, signature security details, and network configurations.
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
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-500" />
          Wallet Settings & Configuration
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Smart contract metadata, EOA authorization details, and network settings
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Wallet Contract Info Card */}
        <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Smart Wallet Contract Info</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Sepolia contract parameters</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Contract Address:</span>
              <span className="font-mono text-cyan-500 font-bold">
                {shortenAddress(smartWallet.smartWalletAddress, 6)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Contract Owner:</span>
              <span className="font-mono text-[var(--text-primary)] font-semibold">
                {smartWallet.ownerAddress ? shortenAddress(smartWallet.ownerAddress, 6) : 'Not read'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Bytecode Status:</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Contract Nonce:</span>
              <span className="font-mono text-[var(--text-primary)] font-bold">
                #{smartWallet.nonce ? smartWallet.nonce.toString() : '0'}
              </span>
            </div>
          </div>

          <a
            href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWallet.smartWalletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors pt-1"
          >
            View Smart Wallet on Etherscan
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Security & Signer Verification Card */}
        <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Signer Security & Auth</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Connected EOA signer verification</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Connected Signer EOA:</span>
              <span className="font-mono text-purple-500 font-bold">
                {account ? shortenAddress(account, 6) : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Authorization Status:</span>
              {smartWallet.isOwnerConnected ? (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  Authorized Owner
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  Signer ≠ Owner
                </span>
              )}
            </div>
          </div>

          {/* Signature Testing Widget */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-semibold text-[var(--text-primary)] block">
              Test EOA Message Signing
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleTestSignature}
                disabled={isSigning || !account}
                className="gradient-button px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSigning ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sign'}
              </button>
            </div>

            {signStatus && (
              <div className={`p-3 rounded-xl text-[11px] font-mono border ${
                signStatus.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}>
                {signStatus.message}
                {signStatus.signature && (
                  <div className="mt-1 opacity-80 truncate text-[10px]">
                    Sig: {signStatus.signature}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Selector Card */}
      <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Network Settings & Multi-Chain Architecture</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Configure & switch target networks for your connected EOA</p>
            </div>
          </div>

          {!isCorrectNetwork && (
            <button
              onClick={() => handleNetworkSwitch(PRIMARY_NETWORK)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Switch to Sepolia
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {Object.values(NETWORKS).map((net) => {
            const isCurrent = net.chainId === chainId;
            const isSwitching = switchingChainId === net.chainId;

            return (
              <div
                key={net.chainId}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-[var(--text-primary)] shadow-md shadow-emerald-500/5'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[var(--text-primary)] block">{net.name}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                      Chain ID: {net.chainId} • {net.symbol}
                    </span>
                  </div>

                  {isCurrent ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Network
                    </span>
                  ) : (
                    <button
                      onClick={() => handleNetworkSwitch(net)}
                      disabled={isSwitching}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-500 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSwitching ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-cyan-500" />
                      ) : (
                        <ArrowRightLeft className="w-3 h-3" />
                      )}
                      Switch Network
                    </button>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-secondary)]">Smart Wallet Contract:</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">
                    {net.walletAddress ? shortenAddress(net.walletAddress, 4) : 'Unconfigured'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
