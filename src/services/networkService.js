import { PRIMARY_NETWORK, NETWORKS } from '../config/networks';

/**
 * Switch wallet provider to target network (Ethereum Sepolia, Polygon Amoy, etc.)
 */
export const switchNetwork = async (targetNetwork = PRIMARY_NETWORK) => {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet provider detected. Please install MetaMask.');
  }

  try {
    // Request network switch in MetaMask
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetNetwork.hexChainId }]
    });
    return true;
  } catch (error) {
    // Code 4902 means chain has not been added to MetaMask
    if (error.code === 4902) {
      return await addNetworkToWallet(targetNetwork);
    }
    throw error;
  }
};

/**
 * Add custom RPC network to wallet provider if missing
 */
export const addNetworkToWallet = async (network = PRIMARY_NETWORK) => {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: network.hexChainId,
          chainName: network.name,
          nativeCurrency: {
            name: network.symbol,
            symbol: network.symbol,
            decimals: network.decimals
          },
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.explorerUrl]
        }
      ]
    });
    return true;
  } catch (addError) {
    console.error('Failed to add network to wallet:', addError);
    throw addError;
  }
};
