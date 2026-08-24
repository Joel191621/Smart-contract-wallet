export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    hexChainId: '0xaa36a7',
    name: 'Ethereum Sepolia',
    shortName: 'Sepolia',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    apiEndpoint: 'https://api-sepolia.etherscan.io/api',
    isPrimary: true,
    supported: true,
    walletAddress: import.meta.env.VITE_SMART_WALLET_ADDRESS || ''
  },
  polygonAmoy: {
    chainId: 80002,
    hexChainId: '0x13882',
    name: 'Polygon Amoy',
    shortName: 'Amoy',
    symbol: 'POL',
    decimals: 18,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    isPrimary: false,
    supported: Boolean(import.meta.env.VITE_POLYGON_AMOY_WALLET_ADDRESS),
    walletAddress: import.meta.env.VITE_POLYGON_AMOY_WALLET_ADDRESS || ''
  },
  arbitrumSepolia: {
    chainId: 421614,
    hexChainId: '0x66eee',
    name: 'Arbitrum Sepolia',
    shortName: 'Arb Sepolia',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    isPrimary: false,
    supported: Boolean(import.meta.env.VITE_ARBITRUM_SEPOLIA_WALLET_ADDRESS),
    walletAddress: import.meta.env.VITE_ARBITRUM_SEPOLIA_WALLET_ADDRESS || ''
  },
  baseSepolia: {
    chainId: 84532,
    hexChainId: '0x14a34',
    name: 'Base Sepolia',
    shortName: 'Base Sepolia',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    isPrimary: false,
    supported: Boolean(import.meta.env.VITE_BASE_SEPOLIA_WALLET_ADDRESS),
    walletAddress: import.meta.env.VITE_BASE_SEPOLIA_WALLET_ADDRESS || ''
  }
};

export const PRIMARY_NETWORK = NETWORKS.sepolia;

export const getNetworkByChainId = (chainId) => {
  const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  return Object.values(NETWORKS).find(net => net.chainId === numericChainId) || null;
};
