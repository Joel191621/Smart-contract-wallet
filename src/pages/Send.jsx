import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Fuel, AlertCircle, RefreshCw, Send as SendIcon, ShieldAlert, Wallet, Lock } from 'lucide-react';
import { isValidAddress, shortenAddress } from '../utils/address';
import { formatEth, formatUsdValue, parseEthInput } from '../utils/format';
import { estimateSmartWalletGas } from '../services/transactionService';
import { TransactionApproval } from '../components/TransactionApproval';
import { TransactionStatusModal } from '../components/TransactionStatusModal';

export const Send = ({ smartWallet, account, signer, isCorrectNetwork, onSwitchNetwork, onConnect, onTriggerToast }) => {
  const [recipient, setRecipient] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [validationError, setValidationError] = useState('');
  const [gasEstimate, setGasEstimate] = useState(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const smartWalletBalanceEth = formatEth(smartWallet.balance);
  const isNotDeployedContract = smartWallet.capabilities && !smartWallet.capabilities.isDeployed;

  useEffect(() => {
    if (isValidAddress(recipient) && amountEth && parseFloat(amountEth) > 0 && signer && !isNotDeployedContract) {
      setIsEstimatingGas(true);
      estimateSmartWalletGas(recipient, amountEth, signer, smartWallet.smartWalletAddress)
        .then(est => setGasEstimate(est))
        .catch(err => console.warn('Gas estimate error:', err))
        .finally(() => setIsEstimatingGas(false));
    } else {
      setGasEstimate(null);
    }
  }, [recipient, amountEth, signer, smartWallet.smartWalletAddress, isNotDeployedContract]);

  const handleMaxAmount = () => {
    if (smartWallet.balance <= 0n) {
      setAmountEth('0');
      return;
    }
    const ethVal = parseFloat(formatEth(smartWallet.balance, 6));
    setAmountEth(ethVal.toString());
  };

  const handleReview = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!account) {
      setValidationError('Please connect your EOA wallet first.');
      return;
    }

    if (!isCorrectNetwork) {
      setValidationError('Your wallet is on the wrong network. Please switch to Sepolia.');
      return;
    }

    if (isNotDeployedContract) {
      setValidationError(`Address ${shortenAddress(smartWallet.smartWalletAddress, 4)} in .env is an EOA (Personal Account), not a deployed Smart Contract.`);
      return;
    }

    if (!isValidAddress(recipient)) {
      setValidationError('Please enter a valid Ethereum recipient address.');
      return;
    }

    const parsedWei = parseEthInput(amountEth);
    if (parsedWei <= 0n) {
      setValidationError('Amount must be greater than 0 ETH.');
      return;
    }

    if (smartWallet.balance < parsedWei) {
      setValidationError(`Insufficient Smart Wallet balance (${smartWalletBalanceEth} ETH available).`);
      return;
    }

    setShowApprovalModal(true);
  };

  const handleConfirmSend = () => {
    setShowApprovalModal(false);
    smartWallet.sendEth(recipient, amountEth);
  };

  if (!account) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 text-center">
        <div className="rounded-3xl glass-panel p-8 border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              Send ETH Protected
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
              Connect your EOA Web3 wallet to authorize and execute transfers from your Smart Contract Wallet.
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
      
      {/* Clean Header */}
      <div className="text-center">
        <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Send ETH
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Transfer funds from Smart Contract Wallet
        </p>
      </div>

      {/* Contract Bytecode Warning if user passed EOA in .env */}
      {isNotDeployedContract && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-500">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Configured Address is an EOA (Personal Account)</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            The address in your <code className="font-mono text-amber-500">.env</code> file (<code>{shortenAddress(smartWallet.smartWalletAddress, 4)}</code>) is a personal wallet address, not a deployed Smart Contract. Smart Wallet execution calls require a deployed contract address.
          </p>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-5">
        
        {/* Source Wallet Info */}
        <div className="bg-[var(--bg-card-subtle)] rounded-2xl p-3.5 border border-[var(--border-color)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] font-medium">From Smart Wallet:</span>
          <span className="font-mono font-bold text-cyan-500">
            {shortenAddress(smartWallet.smartWalletAddress, 4)} ({smartWalletBalanceEth} ETH)
          </span>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleReview} className="space-y-4">
          
          {/* Recipient Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)] block">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value.trim());
                setValidationError('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[var(--text-primary)]">Amount (ETH)</label>
              <button
                type="button"
                onClick={handleMaxAmount}
                className="text-cyan-500 hover:text-cyan-400 font-bold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Max
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amountEth}
                onChange={(e) => {
                  setAmountEth(e.target.value);
                  setValidationError('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <div className="absolute right-3 top-3 text-xs text-[var(--text-secondary)] font-bold">
                ETH
              </div>
            </div>
            {amountEth && parseFloat(amountEth) > 0 && (
              <span className="text-[11px] text-[var(--text-secondary)] block text-right font-mono">
                ≈ {formatUsdValue(amountEth)}
              </span>
            )}
          </div>

          {/* Gas Estimate */}
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-500" />
              Est. Network Fee:
            </span>
            <span className="font-mono text-[var(--text-primary)]">
              {isEstimatingGas ? 'Estimating...' : gasEstimate ? `~${formatEth(gasEstimate.estimatedCostWei, 6)} ETH` : '~0.000225 ETH'}
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full gradient-button py-3.5 px-5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <SendIcon className="w-4 h-4" />
            Review & Send
          </button>
        </form>
      </div>

      {/* Transaction Approval Modal */}
      <TransactionApproval
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleConfirmSend}
        recipient={recipient}
        amountEth={amountEth}
        smartWalletAddress={smartWallet.smartWalletAddress}
        connectedEOA={account}
        gasEstimate={gasEstimate}
        isOwnerConnected={smartWallet.isOwnerConnected}
      />

      {/* Live Transaction Status Modal */}
      <TransactionStatusModal
        txState={smartWallet.txState}
        onClose={() => smartWallet.resetTxState()}
        onTryAgain={() => {
          smartWallet.resetTxState();
          setShowApprovalModal(true);
        }}
      />
    </div>
  );
};
