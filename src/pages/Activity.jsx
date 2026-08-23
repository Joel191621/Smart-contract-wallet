import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, Filter, Search } from 'lucide-react';
import { fetchTransactionHistory } from '../services/etherscanService';
import { shortenAddress } from '../utils/address';
import { formatRelativeTime } from '../utils/format';
import { PRIMARY_NETWORK } from '../config/networks';

export const ActivityPage = ({ smartWalletAddress }) => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'sent' | 'received'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = () => {
    if (!smartWalletAddress) return;
    setIsLoading(true);
    fetchTransactionHistory(smartWalletAddress)
      .then(txs => setTransactions(txs))
      .catch(err => console.error('Failed to load activity history:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [smartWalletAddress]);

  // Filter & Search logic
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

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-cyan-400" />
            Transaction Activity
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete transaction history for Smart Contract Wallet <code className="font-mono text-cyan-300">{shortenAddress(smartWalletAddress, 6)}</code>
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh History
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131A2A] p-3 rounded-2xl border border-white/5">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl w-full sm:w-auto">
          {['all', 'sent', 'received'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-none ${
                filter === f
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search address or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Transaction Table Card */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            Fetching Sepolia transaction records...
          </div>
        ) : filteredTxs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">To</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Age</th>
                  <th className="py-3 px-3 text-right">Etherscan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTxs.map((tx, idx) => {
                  const isSent = tx.type === 'Sent';
                  return (
                    <tr key={tx.hash || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isSent ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isSent ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          </div>
                          <span className={isSent ? 'text-amber-300' : 'text-emerald-300'}>
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-300">
                        {shortenAddress(tx.from)}
                      </td>
                      <td className="py-3 px-3 font-mono text-cyan-300">
                        {shortenAddress(tx.to)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white font-mono">
                        {tx.amountEth} ETH
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {formatRelativeTime(tx.timestamp)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`${PRIMARY_NETWORK.explorerUrl}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-cyan-400 transition-colors inline-block p-1"
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
          <div className="py-12 text-center text-xs text-gray-400 space-y-2">
            <p>No transaction activity found matching your criteria.</p>
            <p className="text-[11px] text-gray-500">
              Transactions executed directly via this DApp or on Sepolia testnet will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
