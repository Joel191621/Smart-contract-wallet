import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, ArrowRight, CheckCircle2, RefreshCw, ExternalLink, AlertTriangle, Wallet, Layers, Copy, Check } from 'lucide-react';
import { getFactoryConfig } from '../config/walletConfig';
import { predictWalletAddress, createWallet, getSaltForOwner } from '../services/factoryService';
import { shortenAddress } from '../utils/address';
import { formatEth } from '../utils/format';
import { PRIMARY_NETWORK } from '../config/networks';

export const DeployWallet = ({
  account,
  signer,
  provider,
  onConnect,
  onTriggerToast,
  onWalletDeployed
}) => {
  const factoryConfig = getFactoryConfig();

  const [salt, setSalt] = useState('');
  const [predictedAddress, setPredictedAddress] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedPredicted, setCopiedPredicted] = useState(false);

  // Auto-predict CREATE2 address when account or factoryConfig changes
  useEffect(() => {
    if (account && provider && factoryConfig.isConfigured) {
      handlePredict(account, salt);
    } else {
      setPredictedAddress(null);
    }
  }, [account, provider, factoryConfig.isConfigured]);

  const handlePredict = async (userAccount = account, customSalt = salt) => {
    if (!userAccount || !provider || !factoryConfig.isConfigured) return;
    setIsPredicting(true);
    setError(null);
    try {
      const predicted = await predictWalletAddress(userAccount, customSalt, provider, factoryConfig.address);
      setPredictedAddress(predicted);
    } catch (err) {
      console.error('Failed to predict address:', err);
      setError('Could not calculate predicted address. Verify factory configuration.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleDeploy = async () => {
    if (!account || !signer) {
      setError('Please connect your EOA wallet first.');
      return;
    }
    if (!factoryConfig.isConfigured) {
      setError('Factory contract address is not configured in .env (VITE_FACTORY_ADDRESS).');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setDeployResult(null);

    try {
      const targetSalt = getSaltForOwner(account, salt);
      const result = await createWallet(account, salt, signer, factoryConfig.address);
      
      const isMatch = result.proxyAddress.toLowerCase() === (predictedAddress || '').toLowerCase();

      setDeployResult({
        ...result,
        isMatch,
        owner: account
      });

      if (onTriggerToast) {
        onTriggerToast('Smart Wallet Proxy deployed successfully!');
      }

      if (onWalletDeployed) {
        onWalletDeployed(result.proxyAddress);
      }
    } catch (err) {
      console.error('Deployment error:', err);
      setError(err.reason || err.message || 'Factory deployment failed.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyPredicted = () => {
    if (!predictedAddress) return;
    navigator.clipboard.writeText(predictedAddress);
    setCopiedPredicted(true);
    if (onTriggerToast) {
      onTriggerToast('Predicted address copied to clipboard!');
    }
    setTimeout(() => setCopiedPredicted(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-cyan-500" />
          Deploy Smart Wallet (CREATE2 Factory)
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Pre-compute your deterministic smart wallet address and deploy an ERC1967 UUPS proxy instance
        </p>
      </div>

      {/* Factory Configuration Warning */}
      {!factoryConfig.isConfigured && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">WalletFactory Unconfigured</strong>
            Set <code className="font-mono bg-black/20 px-1 py-0.5 rounded">VITE_FACTORY_ADDRESS</code> in your <code className="font-mono bg-black/20 px-1 py-0.5 rounded">.env</code> file to enable CREATE2 deployment.
          </div>
        </div>
      )}

      {/* 3-Step Wizard Container */}
      <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-6">
        
        {/* Step Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 pb-4 border-b border-[var(--border-color)] text-xs">
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${account ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold' : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Connect EOA</span>
          </div>

          <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${predictedAddress ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500 font-bold' : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Predict Address</span>
          </div>

          <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${deployResult ? 'bg-purple-500/10 border-purple-500/30 text-purple-500 font-bold' : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-[10px] font-bold">3</span>
            <span>Deploy Proxy</span>
          </div>
        </div>

        {/* STEP 1: Connect EOA Signer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center">1</span>
              Connect EOA Signer
            </h3>
            {account && (
              <span className="text-xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Connected: {shortenAddress(account, 4)}
              </span>
            )}
          </div>

          {!account ? (
            <button
              onClick={onConnect}
              className="gradient-button px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Wallet className="w-4 h-4" />
              Connect Web3 Wallet (MetaMask)
            </button>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">
              EOA Owner <code className="font-mono text-[var(--text-primary)]">{account}</code> will own the deployed Smart Wallet proxy.
            </p>
          )}
        </div>

        {/* STEP 2: Predict CREATE2 Address */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center">2</span>
              Predict Smart Wallet Address (CREATE2)
            </h3>
            {predictedAddress && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                NOT DEPLOYED YET
              </span>
            )}
          </div>

          <div className="bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Pre-Computed Smart Wallet Address:</span>
              {isPredicting ? (
                <span className="text-xs font-mono text-cyan-500 flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Calculating CREATE2...
                </span>
              ) : predictedAddress ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-500 font-bold break-all">
                    {predictedAddress}
                  </span>
                  <button
                    onClick={handleCopyPredicted}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {copiedPredicted ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-[var(--text-secondary)] italic">Connect EOA to calculate address</span>
              )}
            </div>
          </div>
        </div>

        {/* STEP 3: Deploy Smart Wallet Proxy */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center">3</span>
            Deploy Smart Wallet Proxy
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleDeploy}
            disabled={!account || !factoryConfig.isConfigured || isDeploying}
            className="w-full gradient-button py-3.5 px-6 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Deploying Proxy via CREATE2...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                Deploy Smart Wallet Proxy
              </>
            )}
          </button>
        </div>

        {/* STEP 3 Result Banner: Post-Deployment Verification */}
        {deployResult && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 text-xs space-y-3 animate-toast">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Smart Wallet Proxy Successfully Deployed!</span>
            </div>

            <div className="space-y-2 bg-[var(--bg-card-subtle)] p-3.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-primary)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Address Match Assertion:</span>
                <span className={`font-mono font-bold ${deployResult.isMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {deployResult.isMatch ? 'Predicted Address === Deployed Proxy Address ✓' : 'Mismatch detected'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Deployed Proxy Address:</span>
                <span className="font-mono text-cyan-500 font-bold">{deployResult.proxyAddress}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Wallet Owner:</span>
                <span className="font-mono">{deployResult.owner}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Wallet Version:</span>
                <span className="font-mono text-purple-400 font-bold">v1 (UUPS Upgradeable)</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Transaction Hash:</span>
                <a
                  href={`${PRIMARY_NETWORK.explorerUrl}/tx/${deployResult.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan-500 hover:underline flex items-center gap-1"
                >
                  {shortenAddress(deployResult.hash, 6)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
