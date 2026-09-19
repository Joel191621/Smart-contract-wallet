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

  // Directly check against 11155111 or 0xaa36a7
  const isCorrectNetwork = Boolean(chainId) && (
    Number(chainId) === 11155111 || 
    String(chainId).toLowerCase() === '0xaa36a7'
  );

  const currentNetwork = getNetworkByChainId(chainId) || (chainId ? { name: `Chain ${chainId}`, chainId: Number(chainId) } : null);

  // Directly query EIP-1193 eth_chainId from window.ethereum to bypass any library caching
  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;
    const userDisconnected = localStorage.getItem(DISCONNECT_FLAG_KEY) === 'true';
    if (userDisconnected) {
      setAccount(null);
      setSigner(null);
      return;
    }

    try {
      // Read exact raw active chainId directly from MetaMask provider
      const rawHexChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(rawHexChainId, 16);
      setChainId(currentChainId);

      const browserProvider = new BrowserProvider(window.ethereum, 'any');
      setProvider(browserProvider);

      const accounts = await browserProvider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        const ethSigner = await browserProvider.getSigner();
        setSigner(ethSigner);
      } else {
        setAccount(null);
        setSigner(null);
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
            const browserProvider = new BrowserProvider(window.ethereum, 'any');
            const ethSigner = await browserProvider.getSigner();
            setSigner(ethSigner);
          }
        }
      };

      const handleChainChanged = async (newHexChainId) => {
        const newChainId = typeof newHexChainId === 'string'
          ? (newHexChainId.startsWith('0x') ? parseInt(newHexChainId, 16) : Number(newHexChainId))
          : Number(newHexChainId);
        
        setChainId(newChainId);

        try {
          const browserProvider = new BrowserProvider(window.ethereum, 'any');
          setProvider(browserProvider);
          const accounts = await browserProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            const ethSigner = await browserProvider.getSigner();
            setSigner(ethSigner);
          }
        } catch (e) {
          console.warn('Chain change handler refresh warning:', e);
        }
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

  // Connect wallet with explicit MetaMask permission modal prompt window
  const connect = async () => {
    if (!window.ethereum) {
      setError('No Web3 wallet extension found. Please install MetaMask to continue.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    localStorage.removeItem(DISCONNECT_FLAG_KEY);

    try {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (permError) {
        if (permError.code === 4001) {
          throw new Error('Wallet connection request rejected by user.');
        }
      }

      const browserProvider = new BrowserProvider(window.ethereum, 'any');
      setProvider(browserProvider);
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const ethSigner = await browserProvider.getSigner();
        setSigner(ethSigner);
        
        const rawHexChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(rawHexChainId, 16));
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

  // Switch network to target network
  const switchNetwork = async (targetNetwork = PRIMARY_NETWORK) => {
    setError(null);
    try {
      await requestSwitchNetwork(targetNetwork);
      const rawHexChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(rawHexChainId, 16));
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
