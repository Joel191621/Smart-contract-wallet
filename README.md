# Vault Sentinel — Smart Contract Wallet DApp with EOA-Based Signing

A production-grade, highly secure **Smart Contract Wallet Web DApp** built with React, Vite, Tailwind CSS, and Ethers.js v6.

This DApp implements a strict separation of concerns between **Authentication/Signing** and **Asset Custody/Execution**:
* The connected **EOA (External Owned Account / MetaMask)** is used **ONLY as the user's signer and authenticator**.
* The **Smart Contract Wallet** is the **actual account** that holds ETH, receives ETH, sends ETH, and executes operations on the Ethereum network.

---

## 1. Core Architecture

```text
                    ┌────────────────────────┐
                    │      User / UI         │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   Connected EOA        │
                    │  MetaMask / Wallet     │
                    │  (Signer / Auth ONLY)  │
                    └───────────┬────────────┘
                                │
                          Sign Message /
                      Submit Exec Call
                                │
                                ▼
              ┌──────────────────────────────────┐
              │   Smart Contract Wallet          │
              │                                  │
              │  - Configured via .env           │
              │  - Holds ETH assets              │
              │  - Executes transactions         │
              │  - Validates Owner Signature     │
              │  - Supports EIP-1271 / execute   │
              └──────────────────────────────────┘
                                │
                                ▼
                      Ethereum Sepolia Network
```

---

## 2. EOA vs. Smart Contract Wallet Roles

| Feature / Role | Connected EOA (MetaMask) | Smart Contract Wallet |
| :--- | :--- | :--- |
| **Primary Account** | ❌ No | ✅ **Yes (Actual Wallet)** |
| **Asset Custody** | ❌ Does not hold wallet funds | ✅ **Holds all ETH funds** |
| **Displayed Balance** | ❌ Excluded from main UI | ✅ **Displayed as Main Balance** |
| **Receiving Address** | ❌ Not used for receiving | ✅ **Primary Receive Address** |
| **Signing / Auth** | ✅ **Authenticates & Signs** | ❌ Evaluates Signatures |
| **Execution Engine** | ❌ Initiates payload | ✅ **Executes on-chain calls** |

---

## 3. Deployment Configuration

This DApp connects to an **already deployed Smart Contract Wallet**.
* **NO** contract deployment flows exist in the UI.
* **NO** factory contracts are loaded.
* The frontend simply connects to the contract address supplied in the `.env` file.

### Environment Setup (`.env`)

Create a `.env` file in the project root (or copy `.env.example`):

```env
# Deployed Smart Contract Wallet Address (Sepolia Testnet)
VITE_SMART_WALLET_ADDRESS=0x71C7656EC7ab88b098defB751B7401B5f6d8976F

# Sepolia RPC Endpoint URL
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

---

## 4. Contract ABI Configuration

The contract ABI is stored at:
```text
src/contracts/SmartWalletABI.json
```

If your separately deployed Smart Contract Wallet uses a custom ABI, simply paste your JSON ABI into `src/contracts/SmartWalletABI.json`.

A reference Solidity contract matching this ABI is provided at `contracts/SmartWallet.sol`.

---

## 5. Getting Started & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MetaMask** or any EIP-1193 Web3 Wallet Extension

### Installation Steps

1. Clone or navigate to the repository directory:
   ```bash
   cd "SMART CONTRACT WALLET"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file with your deployed Smart Contract Wallet address on Sepolia.

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

---

## 6. How Signature & Execution Work

On Ethereum, smart contracts cannot initiate transactions spontaneously. An on-chain execution requires gas and a signature payload from an authorized EOA.

### Single-Sign Execution Flow:

1. **User Request**: User inputs recipient address & amount in the **Send ETH** tab.
2. **Review**: The **Transaction Approval** modal displays a full summary:
   * Action: Send ETH
   * From: Smart Contract Wallet (`0x...`)
   * To: Recipient (`0x...`)
   * Amount: ETH & USD value
   * Gas estimate
3. **EOA Signature & Execution**: Clicking **Approve & Send** prompts MetaMask for authorization.
4. **On-Chain Execution**: The connected EOA invokes `SmartWallet.execute(recipient, amountInWei, "0x")`.
5. **Validation & Execution**: The Smart Contract Wallet verifies `msg.sender == owner`, transfers the ETH from its contract balance to the recipient, and emits `ExecutionSuccess`.
6. **Confirmation**: Real-time status modal tracks mining and returns a direct **Sepolia Etherscan** link.

---

## 7. Wallet Features

* **Dashboard**: Displays Smart Contract Wallet address, ETH balance, connected EOA signer status, and quick activity summary.
* **Send ETH**: Recipient checksum validation, max balance calculation, gas fee estimation, approval modal, and live status tracker.
* **Receive ETH**: Generates a high-resolution QR code for the **Smart Contract Wallet address**, with 1-click address copy and warning banners.
* **Activity History**: Complete transaction log with type (Sent/Received), status, timestamp, filters, search, and direct block explorer links.
* **Settings**: Inspects smart contract capabilities (bytecode status, owner address, nonces, EIP-1271 support), network selection, and interactive EOA message signing test tool.

---

## 8. Security Considerations

* 🔒 **Zero Key Storage**: Private keys and seed phrases are NEVER requested, handled, or stored.
* 🛡️ **Sanitized Environment Variables**: No server secrets or private keys are exposed via Vite frontend variables.
* 🚦 **Network Isolation**: Strict verification ensures transactions are executed on Ethereum Sepolia (Chain ID: `11155111`).
* 📜 **Explicit Approvals**: All transactions require explicit pre-flight review before requesting wallet signatures.
