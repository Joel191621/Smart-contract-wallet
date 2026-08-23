import React, { useState, useEffect } from 'react';
import { WalletCard } from '../components/WalletCard';
import { fetchTransactionHistory } from '../services/etherscanService';
import { shortenAddress } from '../utils/address';
import { formatRelativeTime } from '../utils/format';
import { ArrowUpRight, ArrowDownLeft, Activity, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { PRIMARY_NETWORK } from '../config/networks';

export const Dashboard = ({
  smartWallet,
  account,
  onConnect,
  onNavigate
}) => {
  const [recentTxs, setRecentTxs] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  useEffect(() => {
    if (smartWallet.smartWalletAddress) {
      setLoadingTxs(true);
      fetchTransactionHistory(smartWallet.smartWalletAddress)
        .then(txs => setRecentTxs(txs.slice(0, 4)))
        .catch(err => console.error('Failed to fetch recent txs:', err))
        .finally(() => setLoadingTxs(false));
    }
  }, [smartWallet.smartWalletAddress]);

  const handleRefresh = () => {
    smartWallet.refreshData();
    if (smartWallet.smartWalletAddress) {
      setLoadingTxs(true);
      fetchTransactionHistory(smartWallet.smartWalletAddress)
        .then(txs => setRecentTxs(txs.slice(0, 4)))
        .finally(() => setLoadingTxs(false));
    }
  };

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
      />

      {/* Clean Recent Activity Card */}
      <div className="rounded-3xl glass-panel p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Recent Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingTxs ? (
          <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            Loading recent transactions...
          </div>
        ) : recentTxs.length > 0 ? (
          <div className="space-y-2">
            {recentTxs.map((tx, idx) => {
              const isSent = tx.type === 'Sent';
              return (
                <div
                  key={tx.hash || idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0F19]/60 hover:bg-[#0B0F19] border border-white/5 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSent ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">
                        {isSent ? 'Sent ETH' : 'Received ETH'}
                      </span>
                      <span className="font-mono text-[11px] text-gray-400">
                        {isSent ? `To: ${shortenAddress(tx.to, 4)}` : `From: ${shortenAddress(tx.from, 4)}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">
                      {isSent ? '-' : '+'}{tx.amountEth} ETH
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatRelativeTime(tx.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-gray-400">
            No recent activity on Sepolia testnet.
          </div>
        )}
      </div>

      {/* Minimal Footer Note */}
      <div className="text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5 pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Connected EOA acts strictly as Signer • Smart Wallet holds all assets</span>
      </div>
    </div>
  );
};
