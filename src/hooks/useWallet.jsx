import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { PRIMARY_NETWORK, getNetworkByChainId } from '../config/networks';
import { switchNetwork as requestSwitchNetwork } from '../services/networkService';

const DISCONNECT_FLAG_KEY = 'eoa_wallet_disconnected';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === PRIMARY_NETWORK.chainId;
  const currentNetwork = getNetworkByChainId(chainId) || (chainId ? { name: `Chain ${chainId}`, chainId } : null);

  // Initialize provider and check existing connection if user hasn't explicitly disconnected
  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;
    const userDisconnected = localStorage.getItem(DISCONNECT_FLAG_KEY) === 'true';
    if (userDisconnected) return; // Respect explicit disconnect

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));

      const accounts = await browserProvider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        const ethSigner = await browserProvider.getSigner();
        setSigner(ethSigner);
      }
    } catch (err) {
      console.warn('Error checking existing wallet connection:', err);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        const userDisconnected = localStorage.getItem(DISCONNECT_FLAG_KEY) === 'true';
        if (accounts.length === 0 || userDisconnected) {
          setAccount(null);
          setSigner(null);
        } else {
          setAccount(accounts[0]);
          if (window.ethereum) {
            const browserProvider = new BrowserProvider(window.ethereum);
            const ethSigner = await browserProvider.getSigner();
            setSigner(ethSigner);
          }
        }
      };

      const handleChainChanged = (newHexChainId) => {
        const newChainId = parseInt(newHexChainId, 16);
        setChainId(newChainId);
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [checkConnection]);

  // Connect wallet with explicit MetaMask permission modal prompt
  const connect = async () => {
    if (!window.ethereum) {
      setError('No Web3 wallet extension found. Please install MetaMask to continue.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    localStorage.removeItem(DISCONNECT_FLAG_KEY); // Clear disconnect flag

    try {
      // Force MetaMask permission request popup window to select/authorize account
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (permError) {
        // If user closes or cancels permissions popup, throw user rejection
        if (permError.code === 4001) {
          throw new Error('Wallet connection request rejected by user.');
        }
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const ethSigner = await browserProvider.getSigner();
        setSigner(ethSigner);
        
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet & save user disconnect preference
  const disconnect = () => {
    localStorage.setItem(DISCONNECT_FLAG_KEY, 'true');
    setAccount(null);
    setSigner(null);
    setError(null);
  };

  const switchNetwork = async () => {
    setError(null);
    try {
      await requestSwitchNetwork(PRIMARY_NETWORK);
    } catch (err) {
      setError(err.message || 'Failed to switch network.');
    }
  };

  return {
    account,
    signer,
    provider,
    chainId,
    currentNetwork,
    isCorrectNetwork,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork
  };
};
