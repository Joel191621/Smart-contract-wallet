/**
 * Translates Web3 and RPC errors into clean, readable error strings.
 * @param {Error|any} error 
 * @returns {{ message: string, technicalDetails: string }}
 */
export const parseWeb3Error = (error) => {
  if (!error) {
    return {
      message: 'An unknown error occurred.',
      technicalDetails: ''
    };
  }

  const rawMessage = error.message || String(error);
  const errorCode = error.code;

  // EIP-1193 User Rejected Request
  if (errorCode === 4001 || rawMessage.includes('user rejected') || rawMessage.includes('ACTION_REJECTED')) {
    return {
      message: 'Transaction rejected by user in wallet.',
      technicalDetails: 'User declined signature or transaction prompt in MetaMask.'
    };
  }

  // -32602: Sending contract calldata to an EOA address
  if (
    rawMessage.includes('External transactions to internal accounts cannot include data') ||
    rawMessage.includes('-32602') ||
    rawMessage.includes('cannot include data')
  ) {
    return {
      message: 'Configured Smart Wallet address is an EOA (Personal Account), not a Smart Contract.',
      technicalDetails: 'RPC Error -32602: You passed a standard MetaMask EOA address in .env instead of a deployed Smart Contract Wallet address. Contract function calls require a deployed contract bytecode.'
    };
  }

  // Insufficient Funds
  if (rawMessage.includes('insufficient funds') || errorCode === 'INSUFFICIENT_FUNDS') {
    return {
      message: 'Insufficient balance to cover execution and gas costs.',
      technicalDetails: rawMessage
    };
  }

  // Network Switch Rejected
  if (errorCode === 4902) {
    return {
      message: 'Sepolia network is not configured in your Web3 wallet.',
      technicalDetails: 'Network definition missing from provider.'
    };
  }

  // Contract Reverted
  if (rawMessage.includes('execution failed') || rawMessage.includes('revert') || rawMessage.includes('CALL_EXCEPTION')) {
    let revertReason = 'Smart contract execution reverted on-chain.';
    if (rawMessage.includes('caller is not the owner')) {
      revertReason = 'Connected EOA signer is not authorized as the contract wallet owner.';
    } else if (rawMessage.includes('insufficient wallet balance')) {
      revertReason = 'Smart Contract Wallet has insufficient ETH balance for this transfer.';
    }
    return {
      message: revertReason,
      technicalDetails: rawMessage
    };
  }

  // Nonce Error
  if (rawMessage.includes('nonce')) {
    return {
      message: 'Transaction nonce error or signature replay attempt.',
      technicalDetails: rawMessage
    };
  }

  return {
    message: rawMessage.length > 100 ? rawMessage.substring(0, 100) + '...' : rawMessage,
    technicalDetails: rawMessage
  };
};
