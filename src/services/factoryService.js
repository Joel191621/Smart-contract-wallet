import { Contract, keccak256, toUtf8Bytes, getAddress } from 'ethers';
import WalletFactoryABI from '../contracts/WalletFactoryABI.json';

/**
 * Generate standard bytes32 salt from owner address if not explicitly supplied.
 */
export const getSaltForOwner = (ownerAddress, customSalt) => {
  if (customSalt && customSalt.startsWith('0x') && customSalt.length === 66) {
    return customSalt;
  }
  return keccak256(toUtf8Bytes(`vault-sentinel-${ownerAddress.toLowerCase()}`));
};

/**
 * Predict deterministic CREATE2 smart wallet address.
 */
export const predictWalletAddress = async (ownerAddress, salt, runner, factoryAddress) => {
  if (!factoryAddress || !runner) return null;
  const targetSalt = getSaltForOwner(ownerAddress, salt);
  const factory = new Contract(factoryAddress, WalletFactoryABI, runner);
  try {
    const predicted = await factory.predictWalletAddress(ownerAddress, targetSalt);
    return getAddress(predicted);
  } catch (err) {
    console.error('Failed to predict wallet address:', err);
    throw err;
  }
};

/**
 * Deploy deterministic smart wallet proxy instance via Factory CREATE2 call.
 */
export const createWallet = async (ownerAddress, salt, signer, factoryAddress) => {
  if (!factoryAddress || !signer) {
    throw new Error('Missing factory address or connected EOA signer.');
  }

  const targetSalt = getSaltForOwner(ownerAddress, salt);
  const factory = new Contract(factoryAddress, WalletFactoryABI, signer);

  try {
    const tx = await factory.createWallet(ownerAddress, targetSalt);
    const receipt = await tx.wait();

    let deployedProxyAddress = null;
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);
          if (parsed && parsed.name === 'WalletCreated') {
            deployedProxyAddress = getAddress(parsed.args.wallet);
            break;
          }
        } catch {
          // Ignore logs from unparsed contracts
        }
      }
    }

    if (!deployedProxyAddress) {
      deployedProxyAddress = await factory.predictWalletAddress(ownerAddress, targetSalt);
    }

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      proxyAddress: getAddress(deployedProxyAddress),
      salt: targetSalt
    };
  } catch (err) {
    console.error('createWallet transaction failed:', err);
    throw err;
  }
};

/**
 * Batch deploy multiple smart wallet proxies.
 */
export const batchCreateWallets = async (owners, salts, signer, factoryAddress) => {
  if (!factoryAddress || !signer) {
    throw new Error('Missing factory address or signer.');
  }
  const factory = new Contract(factoryAddress, WalletFactoryABI, signer);
  const tx = await factory.batchCreateWallets(owners, salts);
  const receipt = await tx.wait();
  return receipt;
};
