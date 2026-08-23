import { PRIMARY_NETWORK } from '../config/networks';
import { formatEth } from '../utils/format';

const LOCAL_TX_CACHE_KEY = 'smart_wallet_tx_history';

/**
 * Get locally saved transactions from localStorage
 */
export const getLocalTxHistory = (walletAddress) => {
  try {
    const raw = localStorage.getItem(`${LOCAL_TX_CACHE_KEY}_${walletAddress.toLowerCase()}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

/**
 * Save a new local transaction to localStorage cache
 */
export const saveLocalTx = (walletAddress, txRecord) => {
  try {
    const history = getLocalTxHistory(walletAddress);
    const updated = [txRecord, ...history.filter(t => t.hash !== txRecord.hash)];
    localStorage.setItem(`${LOCAL_TX_CACHE_KEY}_${walletAddress.toLowerCase()}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save tx to local cache:', err);
  }
};

/**
 * Fetch transaction history from Sepolia Etherscan API with local cache merging
 */
export const fetchTransactionHistory = async (walletAddress) => {
  if (!walletAddress) return [];

  const localTxs = getLocalTxHistory(walletAddress);

  try {
    const apiEndpoint = PRIMARY_NETWORK.apiEndpoint;
    const url = `${apiEndpoint}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken`;

    const response = await fetch(url);
    const data = await response.json();

    let fetchedTxs = [];
    if (data.status === '1' && Array.isArray(data.result)) {
      fetchedTxs = data.result.map(tx => {
        const isSent = tx.from.toLowerCase() === walletAddress.toLowerCase();
        return {
          hash: tx.hash,
          type: isSent ? 'Sent' : 'Received',
          from: tx.from,
          to: tx.to,
          amountEth: formatEth(tx.value),
          valueWei: tx.value,
          status: tx.txreceipt_status === '1' || tx.isError === '0' ? 'Success' : 'Failed',
          timestamp: parseInt(tx.timeStamp) * 1000,
          blockNumber: tx.blockNumber
        };
      });
    }

    // Merge API results with local cached transactions (avoiding duplicates)
    const combinedHashes = new Set(fetchedTxs.map(t => t.hash.toLowerCase()));
    const uniqueLocalTxs = localTxs.filter(lt => !combinedHashes.has(lt.hash.toLowerCase()));

    const merged = [...uniqueLocalTxs, ...fetchedTxs].sort((a, b) => b.timestamp - a.timestamp);
    return merged;
  } catch (error) {
    console.warn('Etherscan API fetch failed, falling back to local history:', error);
    return localTxs;
  }
};
