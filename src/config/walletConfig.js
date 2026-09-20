import SmartWalletABI from '../contracts/SmartWalletABI.json';
import WalletFactoryABI from '../contracts/WalletFactoryABI.json';

export const SMART_WALLET_ADDRESS = (import.meta.env.VITE_SMART_WALLET_ADDRESS || '').trim();
export const FACTORY_ADDRESS = (import.meta.env.VITE_FACTORY_ADDRESS || '').trim();
export const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

export { SmartWalletABI, WalletFactoryABI };

export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getSmartWalletConfig = (overrideAddress) => {
  const address = (overrideAddress || SMART_WALLET_ADDRESS || '').trim();
  const isConfigured = Boolean(address) && isValidEthereumAddress(address);

  return {
    address: address || '0x0000000000000000000000000000000000000000',
    isConfigured,
    abi: SmartWalletABI,
    rpcUrl: SEPOLIA_RPC_URL
  };
};

export const getFactoryConfig = () => {
  const address = FACTORY_ADDRESS;
  const isConfigured = Boolean(address) && isValidEthereumAddress(address);

  return {
    address: address || '',
    isConfigured,
    abi: WalletFactoryABI,
    rpcUrl: SEPOLIA_RPC_URL
  };
};
