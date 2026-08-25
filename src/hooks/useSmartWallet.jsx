import { useState, useEffect, useCallback } from 'react';
import { getSmartWalletConfig } from '../config/walletConfig';
import { getEthBalance, getSmartWalletOwner, getSmartWalletNonce, inspectContractCapabilities } from '../services/walletService';
import { executeSendEthFromSmartWallet } from '../services/transactionService';
import { areAddressesEqual } from '../utils/address';
import { parseWeb3Error } from '../utils/errors';
import { saveLocalTx } from '../services/etherscanService';

export const useSmartWallet = (connectedEOA, signer, provider) => {
  const config = getSmartWalletConfig();
  const smartWalletAddress = config.address;

  const [balance, setBalance] = useState(0n);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [nonce, setNonce] = useState(0n);
  const [capabilities, setCapabilities] = useState({
    isDeployed: false,
    hasExecute: false,
    hasOwner: false,
    hasEIP1271: false,
    hasNonce: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transaction execution status state
  const [txState, setTxState] = useState({
    status: 'idle', // 'idle' | 'preparing' | 'waiting_signature' | 'submitting' | 'pending' | 'confirmed' | 'failed' | 'rejected'
    hash: null,
    blockNumber: null,
    message: '',
    errorDetails: null,
    recipient: null,
    amountEth: null,
    smartWalletAddress: null
  });

  // Only consider mismatch if ownerAddress was explicitly fetched AND does not match connectedEOA
  const isOwnerMismatch = Boolean(ownerAddress) && Boolean(connectedEOA) && !areAddressesEqual(connectedEOA, ownerAddress);
  const isOwnerConnected = !isOwnerMismatch;

  // Refresh Smart Wallet state
  const refreshData = useCallback(async () => {
    if (!config.isConfigured || !connectedEOA) {
      setBalance(0n);
      setOwnerAddress(null);
      setNonce(0n);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const activeProvider = provider;
      const [bal, owner, n, caps] = await Promise.all([
        getEthBalance(smartWalletAddress, activeProvider),
        getSmartWalletOwner(smartWalletAddress, activeProvider),
        getSmartWalletNonce(smartWalletAddress, activeProvider),
        inspectContractCapabilities(smartWalletAddress, activeProvider)
      ]);

      setBalance(bal);
      setOwnerAddress(owner);
      setNonce(n);
      setCapabilities(caps);
    } catch (err) {
      console.error('Failed to load smart wallet data:', err);
      setError('Unable to fetch Smart Contract Wallet state from Sepolia RPC.');
    } finally {
      setIsLoading(false);
    }
  }, [config.isConfigured, connectedEOA, smartWalletAddress, provider]);

  useEffect(() => {
    if (!connectedEOA) {
      // Complete reset when disconnected
      setBalance(0n);
      setOwnerAddress(null);
      setNonce(0n);
      setCapabilities({
        isDeployed: false,
        hasExecute: false,
        hasOwner: false,
        hasEIP1271: false,
        hasNonce: false
      });
      setIsLoading(false);
      return;
    }

    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [connectedEOA, refreshData]);

  // Execute Send ETH action from Smart Wallet
  const sendEth = async (recipient, amountEth) => {
    if (!signer || !connectedEOA) {
      setTxState({
        status: 'failed',
        message: 'No EOA signer connected.',
        errorDetails: 'Connect your MetaMask or EOA wallet before sending.',
        recipient,
        amountEth,
        smartWalletAddress
      });
      return false;
    }

    setTxState({
      status: 'preparing',
      hash: null,
      blockNumber: null,
      message: 'Preparing smart contract wallet execution call...',
      errorDetails: null,
      recipient,
      amountEth,
      smartWalletAddress
    });

    try {
      const receipt = await executeSendEthFromSmartWallet(
        recipient,
        amountEth,
        signer,
        smartWalletAddress,
        (update) => {
          setTxState(prev => ({
            ...prev,
            ...update,
            recipient,
            amountEth,
            smartWalletAddress
          }));
        }
      );

      // Save local record for transaction history
      saveLocalTx(smartWalletAddress, {
        hash: receipt.hash,
        type: 'Sent',
        from: smartWalletAddress,
        to: recipient,
        amountEth: amountEth.toString(),
        status: 'Success',
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber
      });

      // Refresh balance after confirmation
      setTimeout(() => refreshData(), 2000);
      return true;
    } catch (err) {
      const parsedError = parseWeb3Error(err);
      const isUserRejected = parsedError.message.includes('rejected');
      setTxState({
        status: isUserRejected ? 'rejected' : 'failed',
        hash: null,
        blockNumber: null,
        message: parsedError.message,
        errorDetails: parsedError.technicalDetails,
        recipient,
        amountEth,
        smartWalletAddress
      });
      return false;
    }
  };

  const resetTxState = () => {
    setTxState({
      status: 'idle',
      hash: null,
      blockNumber: null,
      message: '',
      errorDetails: null,
      recipient: null,
      amountEth: null,
      smartWalletAddress: null
    });
  };

  return {
    smartWalletAddress,
    isConfigured: config.isConfigured,
    balance,
    ownerAddress,
    isOwnerConnected,
    nonce,
    capabilities,
    isLoading,
    error,
    txState,
    sendEth,
    resetTxState,
    refreshData
  };
};
