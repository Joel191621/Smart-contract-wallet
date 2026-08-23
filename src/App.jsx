import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useSmartWallet } from './hooks/useSmartWallet';
import { Navbar } from './components/Navbar';
import { NetworkBanner } from './components/NetworkBanner';
import { Footer } from './components/Footer';

import { Dashboard } from './pages/Dashboard';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { ActivityPage } from './pages/Activity';
import { Settings } from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100 selection:bg-cyan-500 selection:text-black">
      
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
        onDisconnect={disconnect}
        onSwitchNetwork={switchNetwork}
        smartWalletAddress={smartWallet.smartWalletAddress}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render Active View Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard
            smartWallet={smartWallet}
            account={account}
            onConnect={connect}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'send' && (
          <Send
            smartWallet={smartWallet}
            account={account}
            signer={signer}
            isCorrectNetwork={isCorrectNetwork}
            onSwitchNetwork={switchNetwork}
          />
        )}

        {activeTab === 'receive' && (
          <Receive
            smartWalletAddress={smartWallet.smartWalletAddress}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityPage
            smartWalletAddress={smartWallet.smartWalletAddress}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            smartWallet={smartWallet}
            account={account}
            signer={signer}
            chainId={chainId}
            isCorrectNetwork={isCorrectNetwork}
            onSwitchNetwork={switchNetwork}
          />
        )}
      </main>

      {/* Footer */}
      <Footer smartWalletAddress={smartWallet.smartWalletAddress} />
    </div>
  );
}
