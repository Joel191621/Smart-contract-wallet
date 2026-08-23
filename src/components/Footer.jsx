import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { PRIMARY_NETWORK } from '../config/networks';
import { shortenAddress } from '../utils/address';

export const Footer = ({ smartWalletAddress }) => {
  return (
    <footer className="border-t border-white/5 bg-[#0B0F19] py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Smart Contract Wallet Engine • Sepolia Testnet</span>
        </div>
        
        {smartWalletAddress && (
          <div className="flex items-center gap-2">
            <span>Contract:</span>
            <a
              href={`${PRIMARY_NETWORK.explorerUrl}/address/${smartWalletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-gray-300 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              {shortenAddress(smartWalletAddress, 6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div>
          <span>Connected EOA = Signer / Auth Only</span>
        </div>
      </div>
    </footer>
  );
};
