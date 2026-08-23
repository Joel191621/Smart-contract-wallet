import SmartWalletABI from '../contracts/SmartWalletABI.json';

export const SMART_WALLET_ADDRESS = (import.meta.env.VITE_SMART_WALLET_ADDRESS || '').trim();
export const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

export { SmartWalletABI };

export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getSmartWalletConfig = () => {
  const address = SMART_WALLET_ADDRESS;
  const isConfigured = Boolean(address) && isValidEthereumAddress(address);

  return {
    address: address || '0x0000000000000000000000000000000000000000',
    isConfigured,
    abi: SmartWalletABI,
    rpcUrl: SEPOLIA_RPC_URL
  };
};
