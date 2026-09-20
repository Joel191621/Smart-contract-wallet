import { Contract, formatEther } from 'ethers';
import { SmartWalletABI } from '../config/walletConfig';

const LOCAL_TX_CACHE_KEY = 'smart_wallet_tx_history';

export const getLocalTxHistory = (walletAddress) => {
  if (!walletAddress) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_TX_CACHE_KEY}_${walletAddress.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalTx = (walletAddress, txRecord) => {
  if (!walletAddress) return;
  try {
    const history = getLocalTxHistory(walletAddress);
    const updated = [txRecord, ...history.filter((t) => t.hash !== txRecord.hash)];
    localStorage.setItem(`${LOCAL_TX_CACHE_KEY}_${walletAddress.toLowerCase()}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save tx to local cache:', err);
  }
};

const blockTimestamp = async (provider, blockNumber, cache) => {
  if (cache.has(blockNumber)) return cache.get(blockNumber);
  const block = await provider.getBlock(blockNumber);
  const timestamp = block ? Number(block.timestamp) * 1000 : Date.now();
  cache.set(blockNumber, timestamp);
  return timestamp;
};

/**
 * Read wallet activity directly from the connected RPC. This avoids requiring an
 * Etherscan API key and works with the actual proxy wallet address.
 */
export const fetchTransactionHistory = async (walletAddress, provider) => {
  if (!walletAddress) return [];

  const localTxs = getLocalTxHistory(walletAddress);
  if (!provider) return localTxs;

  try {
    const wallet = new Contract(walletAddress, SmartWalletABI, provider);
    const [receivedLogs, executionLogs] = await Promise.all([
      wallet.queryFilter(wallet.filters.Received()),
      wallet.queryFilter(wallet.filters.ExecutionSuccess())
    ]);

    const timestamps = new Map();
    const records = [];

    for (const log of receivedLogs) {
      const sender = log.args?.sender;
      const amount = log.args?.amount ?? 0n;
      records.push({
        hash: log.transactionHash,
        type: 'Received',
        from: sender,
        to: walletAddress,
        amountEth: formatEther(amount),
        valueWei: amount.toString(),
        status: 'Success',
        timestamp: await blockTimestamp(provider, log.blockNumber, timestamps),
        blockNumber: log.blockNumber
      });
    }

    for (const log of executionLogs) {
      const target = log.args?.target;
      const amount = log.args?.value ?? 0n;
      records.push({
        hash: log.transactionHash,
        type: 'Sent',
        from: walletAddress,
        to: target,
        amountEth: formatEther(amount),
        valueWei: amount.toString(),
        status: 'Success',
        timestamp: await blockTimestamp(provider, log.blockNumber, timestamps),
        blockNumber: log.blockNumber
      });
    }

    const byHash = new Map();
    for (const tx of [...localTxs, ...records]) {
      if (tx?.hash) byHash.set(tx.hash.toLowerCase(), tx);
    }

    return [...byHash.values()].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.warn('RPC activity lookup failed; using local history:', error);
    return localTxs;
  }
};
