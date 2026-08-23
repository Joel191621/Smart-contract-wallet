import React, { useState } from 'react';
import { ShieldCheck, ArrowUpRight, ArrowDownLeft, Activity, Settings, LayoutDashboard, LogOut, Copy, Check, Wallet } from 'lucide-react';
import { shortenAddress } from '../utils/address';
import { PRIMARY_NETWORK } from '../config/networks';

export const Navbar = ({
  activeTab,
  setActiveTab,
  account,
  isOwnerConnected,
  isCorrectNetwork,
  currentNetwork,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
  smartWalletAddress
}) => {
  const [copiedEOA, setCopiedEOA] = useState(false);

  const handleCopyEOA = (e) => {
    e.stopPropagation();
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopiedEOA(true);
    setTimeout(() => setCopiedEOA(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'send', label: 'Send', icon: ArrowUpRight },
    { id: 'receive', label: 'Receive', icon: ArrowDownLeft },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Minimal Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Aegis Vault</span>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Smart Wallet
              </span>
            </div>
          </div>

          {/* Clean Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131A2A] p-1 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Network & Account Controls */}
          <div className="flex items-center gap-2">
            {account && (
              <button
                onClick={onSwitchNetwork}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  isCorrectNetwork
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCorrectNetwork ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="hidden sm:inline">
                  {isCorrectNetwork ? PRIMARY_NETWORK.shortName : (currentNetwork?.shortName || 'Wrong Net')}
                </span>
              </button>
            )}

            {account ? (
              <div className="flex items-center gap-1 bg-[#131A2A] border border-white/10 p-1 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-gray-300">
                  <span 
                    className={`w-2 h-2 rounded-full ${isOwnerConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                    title={isOwnerConnected ? 'Authorized Owner' : 'Signer ≠ Owner'}
                  />
                  <span className="font-mono text-[11px] text-white">
                    {shortenAddress(account, 4)}
                  </span>
                  <button onClick={handleCopyEOA} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {copiedEOA ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <button
                  onClick={onDisconnect}
                  className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                  title="Disconnect"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="gradient-button flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-white cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect EOA
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden justify-around py-2 border-t border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] rounded-lg cursor-pointer ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
