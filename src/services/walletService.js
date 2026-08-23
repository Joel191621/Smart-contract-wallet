import { Contract, JsonRpcProvider, BrowserProvider, isAddress } from 'ethers';
import { SMART_WALLET_ADDRESS, SEPOLIA_RPC_URL, SmartWalletABI } from '../config/walletConfig';

/**
 * Gets a read-only RPC provider fallback or BrowserProvider if available.
 */
export const getProvider = () => {
  if (window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  return new JsonRpcProvider(SEPOLIA_RPC_URL);
};

/**
 * Fetch ETH balance of any target address (Smart Wallet or EOA)
 */
export const getEthBalance = async (address, provider = null) => {
  if (!address || !isAddress(address)) return 0n;
  try {
    const activeProvider = provider || getProvider();
    const balance = await activeProvider.getBalance(address);
    return balance;
  } catch (error) {
    console.error(`Failed to fetch balance for ${address}:`, error);
    return 0n;
  }
};

/**
 * Fetch Smart Wallet Owner from contract if owner() method exists.
 */
export const getSmartWalletOwner = async (walletAddress = SMART_WALLET_ADDRESS, provider = null) => {
  if (!walletAddress || !isAddress(walletAddress)) return null;
  try {
    const activeProvider = provider || getProvider();
    const contract = new Contract(walletAddress, SmartWalletABI, activeProvider);
    
    if (typeof contract.owner === 'function') {
      const ownerAddr = await contract.owner();
      return ownerAddr;
    }
    return null;
  } catch (error) {
    console.warn(`Smart wallet at ${walletAddress} owner check warning:`, error);
    return null;
  }
};

/**
 * Fetch Smart Wallet Nonce if nonce() function exists.
 */
export const getSmartWalletNonce = async (walletAddress = SMART_WALLET_ADDRESS, provider = null) => {
  if (!walletAddress || !isAddress(walletAddress)) return 0n;
  try {
    const activeProvider = provider || getProvider();
    const contract = new Contract(walletAddress, SmartWalletABI, activeProvider);

    if (typeof contract.nonce === 'function') {
      const nonceVal = await contract.nonce();
      return nonceVal;
    }
    return 0n;
  } catch (error) {
    console.warn(`Smart wallet nonce check failed:`, error);
    return 0n;
  }
};

/**
 * Validates signature via EIP-1271 isValidSignature if supported by contract.
 */
export const verifyEIP1271Signature = async (hash, signature, walletAddress = SMART_WALLET_ADDRESS, provider = null) => {
  if (!walletAddress || !isAddress(walletAddress)) return false;
  try {
    const activeProvider = provider || getProvider();
    const contract = new Contract(walletAddress, SmartWalletABI, activeProvider);

    if (typeof contract['isValidSignature(bytes32,bytes)'] === 'function') {
      const magicValue = await contract['isValidSignature(bytes32,bytes)'](hash, signature);
      return magicValue === '0x1626ba7e';
    }
    return false;
  } catch (error) {
    console.error('EIP-1271 signature verification failed:', error);
    return false;
  }
};

/**
 * Inspect contract bytecode and ABI capabilities dynamically.
 */
export const inspectContractCapabilities = async (walletAddress = SMART_WALLET_ADDRESS, provider = null) => {
  if (!walletAddress || !isAddress(walletAddress)) {
    return { isDeployed: true, hasExecute: true, hasOwner: true, hasEIP1271: true, hasNonce: true };
  }
  try {
    const activeProvider = provider || getProvider();
    const code = await activeProvider.getCode(walletAddress);
    // Address has contract bytecode if code length > 2
    const isDeployed = code !== '0x' && code !== '0x0' && code.length > 2;

    const contract = new Contract(walletAddress, SmartWalletABI, activeProvider);
    
    return {
      isDeployed,
      hasExecute: typeof contract.execute === 'function',
      hasExecuteSigned: typeof contract.executeSigned === 'function',
      hasOwner: typeof contract.owner === 'function',
      hasEIP1271: typeof contract['isValidSignature(bytes32,bytes)'] === 'function',
      hasNonce: typeof contract.nonce === 'function'
    };
  } catch (error) {
    console.error('Contract inspection warning:', error);
    // Default to true on RPC glitch to avoid blocking
    return { isDeployed: true, hasExecute: true, hasOwner: true, hasEIP1271: true, hasNonce: true };
  }
};
