import React, { useState, useEffect } from 'react';
import { WalletCard } from '../components/WalletCard';
import { fetchTransactionHistory } from '../services/etherscanService';
import { shortenAddress } from '../utils/address';
import { formatRelativeTime } from '../utils/format';
import { ArrowUpRight, ArrowDownLeft, Activity, RefreshCw, Wallet, ShieldCheck } from 'lucide-react';

export const Dashboard = ({
  smartWallet,
  account,
  onConnect,
  onNavigate,
  onTriggerToast
}) => {
  const [recentTxs, setRecentTxs] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  useEffect(() => {
    if (account && smartWallet.smartWalletAddress) {
      setLoadingTxs(true);
      fetchTransactionHistory(smartWallet.smartWalletAddress)
        .then(txs => setRecentTxs(txs.slice(0, 4)))
        .catch(err => console.error('Failed to fetch recent txs:', err))
        .finally(() => setLoadingTxs(false));
    } else {
      setRecentTxs([]);
    }
  }, [account, smartWallet.smartWalletAddress]);

  const handleRefresh = () => {
    smartWallet.refreshData();
    if (account && smartWallet.smartWalletAddress) {
      setLoadingTxs(true);
      fetchTransactionHistory(smartWallet.smartWalletAddress)
        .then(txs => setRecentTxs(txs.slice(0, 4)))
        .finally(() => setLoadingTxs(false));
    }
  };

  // Disconnected state view
  if (!account) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 text-center">
        <div className="rounded-3xl glass-panel p-8 border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mx-auto">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              Wallet Disconnected
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
              Connect your EOA Web3 wallet (MetaMask) to view your Smart Wallet balance, recent activity, and authorize transfers.
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
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Primary Hero Wallet Card */}
      <WalletCard
        smartWalletAddress={smartWallet.smartWalletAddress}
        balance={smartWallet.balance}
        isLoading={smartWallet.isLoading}
        onRefresh={handleRefresh}
        onNavigate={onNavigate}
        connectedEOA={account}
        isOwnerConnected={smartWallet.isOwnerConnected}
        ownerAddress={smartWallet.ownerAddress}
        onTriggerToast={onTriggerToast}
      />

      {/* Clean Recent Activity Card */}
      <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Recent Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingTxs ? (
          <div className="py-6 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
            Loading recent transactions...
          </div>
        ) : recentTxs.length > 0 ? (
          <div className="space-y-2">
            {recentTxs.map((tx, idx) => {
              const isSent = tx.type === 'Sent';
              return (
                <div
                  key={tx.hash || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:border-cyan-500/30 border border-[var(--border-color)] transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isSent ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-primary)] block">
                        {isSent ? 'Sent ETH' : 'Received ETH'}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {isSent ? `To: ${shortenAddress(tx.to, 4)}` : `From: ${shortenAddress(tx.from, 4)}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[var(--text-primary)] block">
                      {isSent ? '-' : '+'}{tx.amountEth} ETH
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                      {formatRelativeTime(tx.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
            No recent activity on Sepolia testnet.
          </div>
        )}
      </div>
    </div>
  );
};
