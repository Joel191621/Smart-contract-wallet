import React, { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useSmartWallet } from './hooks/useSmartWallet';
import { Navbar } from './components/Navbar';
import { NetworkBanner } from './components/NetworkBanner';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { Dashboard } from './pages/Dashboard';
import { DeployWallet } from './pages/DeployWallet';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { ActivityPage } from './pages/Activity';
import { Settings } from './pages/Settings';

const THEME_STORAGE_KEY = 'vault_sentinel_theme';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  });

  const [toast, setToast] = useState({
    message: '',
    isVisible: false
  });

  const showToast = (message) => {
    setToast({ message, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 2500);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const {
    account,
    signer,
    provider,
    chainId,
    currentNetwork,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork
  } = useWallet();

  const smartWallet = useSmartWallet(account, signer, provider);

  const handleDisconnect = () => {
    disconnect();
    showToast("Wallet Disconnected Successfully");
  };

  const handleWalletDeployed = (deployedProxyAddress) => {
    smartWallet.refreshData();
    setActiveTab('dashboard');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'light' ? 'light bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-gray-100'}`}>
      
      {/* Wrong Network Notification Banner */}
      <NetworkBanner
        isConnected={Boolean(account)}
        isCorrectNetwork={isCorrectNetwork}
        currentNetwork={currentNetwork}
        onSwitchNetwork={switchNetwork}
      />

      {/* Main Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        account={account}
        isOwnerConnected={smartWallet.isOwnerConnected}
        isCorrectNetwork={isCorrectNetwork}
        currentNetwork={currentNetwork}
        onConnect={connect}
        onDisconnect={handleDisconnect}
        onSwitchNetwork={switchNetwork}
        smartWalletAddress={smartWallet.smartWalletAddress}
        theme={theme}
        onToggleTheme={toggleTheme}
        onTriggerToast={showToast}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Render Active View Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard
            smartWallet={smartWallet}
            account={account}
            onConnect={connect}
            onNavigate={setActiveTab}
            onTriggerToast={showToast}
          />
        )}

        {activeTab === 'deploy' && (
          <DeployWallet
            account={account}
            signer={signer}
            provider={provider}
            onConnect={connect}
            onTriggerToast={showToast}
            onWalletDeployed={handleWalletDeployed}
          />
        )}

        {activeTab === 'send' && (
          <Send
            smartWallet={smartWallet}
            account={account}
            signer={signer}
            isCorrectNetwork={isCorrectNetwork}
            onSwitchNetwork={switchNetwork}
            onConnect={connect}
            onTriggerToast={showToast}
          />
        )}

        {activeTab === 'receive' && (
          <Receive
            smartWalletAddress={smartWallet.smartWalletAddress}
            account={account}
            onConnect={connect}
            onTriggerToast={showToast}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityPage
            smartWalletAddress={smartWallet.smartWalletAddress}
            account={account}
            onConnect={connect}
            onTriggerToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            smartWallet={smartWallet}
            account={account}
            signer={signer}
            provider={provider}
            chainId={chainId}
            isCorrectNetwork={isCorrectNetwork}
            onSwitchNetwork={switchNetwork}
            onConnect={connect}
            onTriggerToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer smartWalletAddress={smartWallet.smartWalletAddress} />

      {/* Global Floating Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
