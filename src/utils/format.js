import { formatEther, parseEther } from 'ethers';

// Fixed mock Sepolia ETH USD price for visual approximation
const MOCK_ETH_USD_PRICE = 2650.00;

/**
 * Format wei string or BigInt to ETH decimal string
 */
export const formatEth = (wei, decimals = 4) => {
  if (wei === null || wei === undefined) return '0.0000';
  try {
    const ethVal = parseFloat(formatEther(wei));
    return ethVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  } catch (err) {
    console.error('Error formatting ETH:', err);
    return '0.0000';
  }
};

/**
 * Parse ETH input string to Wei BigInt
 */
export const parseEthInput = (ethString) => {
  if (!ethString || isNaN(parseFloat(ethString))) return 0n;
  try {
    return parseEther(ethString.trim());
  } catch {
    return 0n;
  }
};

/**
 * Calculate USD value string for ETH amount
 */
export const formatUsdValue = (ethAmountStr) => {
  const num = parseFloat(ethAmountStr);
  if (isNaN(num)) return '$0.00';
  const usd = num * MOCK_ETH_USD_PRICE;
  return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

/**
 * Format relative timestamp (e.g. "2 min ago", "1 hour ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};
