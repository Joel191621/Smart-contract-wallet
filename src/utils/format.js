import { formatEther, parseEther } from 'ethers';

// Fixed mock Sepolia ETH USD price for visual approximation
const MOCK_ETH_USD_PRICE = 2650.00;

/**
 * Format wei string or BigInt to ETH decimal string with exact string precision (no float rounding errors)
 */
export const formatEth = (wei, decimals = 6) => {
  if (wei === null || wei === undefined) return '0.0000';
  try {
    const rawEth = formatEther(wei);
    const parts = rawEth.split('.');
    if (parts.length === 1) return parts[0] + '.0000';
    const dec = parts[1].substring(0, decimals).replace(/0+$/, '');
    const finalDec = dec.length < 2 ? dec.padEnd(2, '0') : dec;
    return `${parts[0]}.${finalDec}`;
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
 * Format timestamp into real-time date and time (e.g. "Aug 24 at 09:42 AM")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = typeof timestamp === 'number' ? new Date(timestamp > 1e11 ? timestamp : timestamp * 1000) : new Date(timestamp);
  
  if (isNaN(date.getTime())) return 'Recently';

  const timeString = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const dateString = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const diffInSeconds = Math.floor((new Date() - date) / 1000);

  if (diffInSeconds < 60) return `Just now (${timeString})`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago (${timeString})`;
  if (diffInSeconds < 86400) return `Today at ${timeString}`;
  
  return `${dateString} at ${timeString}`;
};
