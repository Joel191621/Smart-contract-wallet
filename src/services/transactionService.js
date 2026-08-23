import { Contract, parseEther, isAddress, ZeroAddress } from 'ethers';
import { SMART_WALLET_ADDRESS, SmartWalletABI } from '../config/walletConfig';

/**
 * Estimate gas cost for executing a Send ETH transaction from Smart Wallet.
 */
export const estimateSmartWalletGas = async (
  recipientAddress,
  amountEth,
  signer,
  walletAddress = SMART_WALLET_ADDRESS
) => {
  if (!signer || !isAddress(recipientAddress) || !amountEth) return null;

  try {
    const contract = new Contract(walletAddress, SmartWalletABI, signer);
    const valueWei = parseEther(amountEth.toString());
    
    // Estimate gas for execute(recipient, value, '0x')
    let gasEstimate;
    if (typeof contract.execute === 'function') {
      gasEstimate = await contract.execute.estimateGas(recipientAddress, valueWei, '0x');
    } else {
      // Fallback estimate for direct call
      gasEstimate = 65000n;
    }

    const feeData = await signer.provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || parseEther('0.00000002');
    const estimatedCostWei = gasEstimate * gasPrice;

    return {
      gasUnits: gasEstimate.toString(),
      gasPriceWei: gasPrice,
      estimatedCostWei
    };
  } catch (error) {
    console.warn('Gas estimation warning:', error);
    // Provide safe default gas estimate structure for UI preview
    return {
      gasUnits: '75000',
      gasPriceWei: parseEther('0.000000003'),
      estimatedCostWei: parseEther('0.000225')
    };
  }
};

/**
 * Execute Send ETH transaction from Smart Wallet via connected EOA owner.
 * SmartWallet.execute(target, value, data)
 */
export const executeSendEthFromSmartWallet = async (
  recipientAddress,
  amountEth,
  signer,
  walletAddress = SMART_WALLET_ADDRESS,
  onStateChange = () => {}
) => {
  if (!signer) {
    throw new Error('No EOA signer connected. Please connect your Web3 wallet first.');
  }

  if (!isAddress(recipientAddress)) {
    throw new Error('Invalid recipient Ethereum address.');
  }

  const valueWei = parseEther(amountEth.toString());
  if (valueWei <= 0n) {
    throw new Error('Amount must be greater than zero ETH.');
  }

  // 1. Verify Smart Wallet balance
  onStateChange({ status: 'preparing', message: 'Checking Smart Contract Wallet balance...' });
  const walletBalance = await signer.provider.getBalance(walletAddress);
  if (walletBalance < valueWei) {
    throw new Error(`Insufficient Smart Contract Wallet balance. Balance: ${walletBalance} wei, Required: ${valueWei} wei.`);
  }

  // 2. Prepare contract execution call
  const contract = new Contract(walletAddress, SmartWalletABI, signer);
  if (typeof contract.execute !== 'function') {
    throw new Error(`Smart Wallet contract at ${walletAddress} does not implement the execute(address,uint256,bytes) function.`);
  }

  // 3. Prompt user for EOA signature / transaction authorization in MetaMask
  onStateChange({
    status: 'waiting_signature',
    message: 'Please authorize & sign the transaction in your connected EOA wallet...'
  });

  const tx = await contract.execute(recipientAddress, valueWei, '0x');

  // 4. Signature approved, transaction submitted to network
  onStateChange({
    status: 'submitting',
    hash: tx.hash,
    message: `Transaction submitted! Hash: ${tx.hash}. Waiting for block confirmation...`
  });

  // 5. Wait for transaction block confirmation
  onStateChange({
    status: 'pending',
    hash: tx.hash,
    message: 'Mining transaction on Sepolia testnet...'
  });

  const receipt = await tx.wait(1);

  if (receipt.status === 1) {
    onStateChange({
      status: 'confirmed',
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      message: 'Transaction successfully executed by Smart Contract Wallet!'
    });
    return receipt;
  } else {
    throw new Error('Transaction execution reverted on-chain.');
  }
};
