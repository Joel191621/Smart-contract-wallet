import { isAddress, getAddress } from 'ethers';

/**
 * Shorten an Ethereum address for display.
 * @param {string} address - The 40-char hex address.
 * @param {number} chars - Number of prefix/suffix characters to keep.
 * @returns {string} Truncated address e.g. "0x1234...5678"
 */
export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  if (!isAddress(address)) return address;
  try {
    const checksummed = getAddress(address);
    return `${checksummed.substring(0, chars + 2)}...${checksummed.substring(checksummed.length - chars)}`;
  } catch {
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  }
};

/**
 * Check if string is valid checksummed or lower/upper hex Ethereum address.
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  return isAddress(address);
};

/**
 * Normalizes address to checksum format.
 */
export const checksumAddress = (address) => {
  if (!address) return '';
  try {
    return getAddress(address);
  } catch {
    return address;
  }
};

/**
 * Check if two addresses match (case-insensitive)
 */
export const areAddressesEqual = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;
  try {
    return getAddress(addr1) === getAddress(addr2);
  } catch {
    return addr1.toLowerCase() === addr2.toLowerCase();
  }
};
