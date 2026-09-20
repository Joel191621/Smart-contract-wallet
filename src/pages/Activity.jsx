import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, Search, Wallet, Lock } from 'lucide-react';
import { fetchTransactionHistory } from '../services/etherscanService';
import { shortenAddress } from '../utils/address';
import { formatRelativeTime } from '../utils/format';
import { PRIMARY_NETWORK } from '../config/networks';

export const ActivityPage = ({ smartWalletAddress, account, provider, onConnect, onTriggerToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = () => {
    if (!account || !smartWalletAddress) return;
    setIsLoading(true);
    fetchTransactionHistory(smartWalletAddress, provider)
      .then(txs => setTransactions(txs))
      .catch(err => console.error('Failed to load activity history:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [smartWalletAddress, account, provider]);

  const filteredTxs = transactions.filter(tx => {
    if (filter === 'sent' && tx.type !== 'Sent') return false;
    if (filter === 'received' && tx.type !== 'Received') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchHash = tx.hash?.toLowerCase().includes(q);
      const matchFrom = tx.from?.toLowerCase().includes(q);
      const matchTo = tx.to?.toLowerCase().includes(q);
      return matchHash || matchFrom || matchTo;
    }
    return true;
  });

  if (!account) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 text-center">
        <div className="rounded-3xl glass-panel p-8 border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              Activity History Disconnected
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
              Connect your EOA Web3 wallet to view on-chain transaction history for your Smart Contract Wallet.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-cyan-500" />
            Transaction Activity
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time transaction log for Smart Wallet <code className="font-mono text-cyan-500 font-bold">{shortenAddress(smartWalletAddress, 6)}</code>
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-black/5 dark:hover:bg-white/10 border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
          Refresh Activity
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-card-subtle)] p-3 rounded-2xl border border-[var(--border-color)]">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl w-full sm:w-auto border border-[var(--border-color)]">
          {['all', 'sent', 'received'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-none ${
                filter === f
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search address or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Transaction Table Card */}
      <div className="rounded-3xl glass-panel p-6 border border-[var(--border-color)]">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
            Fetching Sepolia transaction records...
          </div>
        ) : filteredTxs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">To</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3 text-right">Etherscan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredTxs.map((tx, idx) => {
                  const isSent = tx.type === 'Sent';
                  return (
                    <tr key={tx.hash || idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isSent ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isSent ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          </div>
                          <span className={isSent ? 'text-amber-500' : 'text-emerald-500'}>
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[var(--text-primary)]">
                        {shortenAddress(tx.from)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-cyan-500 font-semibold">
                        {shortenAddress(tx.to)}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[var(--text-primary)] font-mono">
                        {tx.amountEth} ETH
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[var(--text-secondary)] font-mono text-[11px]">
                        {formatRelativeTime(tx.timestamp)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <a
                          href={`${PRIMARY_NETWORK.explorerUrl}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-secondary)] hover:text-cyan-500 transition-colors inline-block p-1"
                          title="View on Sepolia Etherscan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)] space-y-2">
            <p>No transaction activity found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
