import { Contract, getAddress } from 'ethers';
import { SmartWalletABI } from '../config/walletConfig';

export const ERC1967_IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3753a920a3ca505d382bbc';

/**
 * Get native ETH balance of a wallet address
 */
export const getEthBalance = async (walletAddress, provider) => {
  if (!walletAddress || !provider) return 0n;
  try {
    return await provider.getBalance(walletAddress);
  } catch (err) {
    console.error('Error fetching wallet balance:', err);
    return 0n;
  }
};

/**
 * Read current contract owner address
 */
export const getSmartWalletOwner = async (walletAddress, provider) => {
  if (!walletAddress || !provider) return null;
  try {
    const contract = new Contract(walletAddress, SmartWalletABI, provider);
    const owner = await contract.owner();
    return getAddress(owner);
  } catch (err) {
    console.warn('Could not read owner from contract:', err);
    return null;
  }
};

/**
 * Read current contract execution nonce
 */
export const getSmartWalletNonce = async (walletAddress, provider) => {
  if (!walletAddress || !provider) return 0n;
  try {
    const contract = new Contract(walletAddress, SmartWalletABI, provider);
    const nonce = await contract.nonce();
    return BigInt(nonce);
  } catch (err) {
    console.warn('Could not read nonce from contract:', err);
    return 0n;
  }
};

/**
 * Read wallet implementation version (e.g. "v1", "v2")
 */
export const getWalletVersion = async (walletAddress, provider) => {
  if (!walletAddress || !provider) return 'v1';
  try {
    const contract = new Contract(walletAddress, SmartWalletABI, provider);
    return await contract.version();
  } catch {
    return 'v1';
  }
};

/**
 * Read current ERC1967 implementation contract address from storage slot
 */
export const getImplementationSlotAddress = async (walletAddress, provider) => {
  if (!walletAddress || !provider) return null;
  try {
    const storageValue = await provider.getStorage(walletAddress, ERC1967_IMPL_SLOT);
    if (!storageValue || storageValue === '0x' || storageValue === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }
    const hexAddr = '0x' + storageValue.slice(-40);
    return getAddress(hexAddr);
  } catch (err) {
    console.warn('Could not read ERC1967 implementation slot:', err);
    return null;
  }
};

/**
 * Inspect target contract bytecode and capability features
 */
export const inspectContractCapabilities = async (walletAddress, provider) => {
  if (!walletAddress || !provider) {
    return {
      isDeployed: false,
      hasExecute: false,
      hasOwner: false,
      hasEIP1271: false,
      hasNonce: false
    };
  }

  try {
    const code = await provider.getCode(walletAddress);
    const isDeployed = code && code !== '0x' && code !== '0x0';

    if (!isDeployed) {
      return {
        isDeployed: false,
        hasExecute: false,
        hasOwner: false,
        hasEIP1271: false,
        hasNonce: false
      };
    }

    const contract = new Contract(walletAddress, SmartWalletABI, provider);
    
    let hasOwner = false;
    let hasNonce = false;

    try {
      await contract.owner();
      hasOwner = true;
    } catch {}

    try {
      await contract.nonce();
      hasNonce = true;
    } catch {}

    return {
      isDeployed: true,
      hasExecute: true,
      hasOwner,
      hasEIP1271: true,
      hasNonce
    };
  } catch (err) {
    console.error('Error inspecting contract capabilities:', err);
    return {
      isDeployed: false,
      hasExecute: false,
      hasOwner: false,
      hasEIP1271: false,
      hasNonce: false
    };
  }
};
