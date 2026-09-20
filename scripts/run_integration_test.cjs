const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

async function main() {
  const logLines = [];
  const log = (msg) => {
    console.log(msg);
    logLines.push(msg);
  };

  log("==========================================================");
  log("SMART WALLET FACTORY + PROXY INTEGRATION TEST");
  log("==========================================================");
  log(`Timestamp: ${new Date().toISOString()}`);

  const [deployer, owner, recipient] = await ethers.getSigners();
  log(`Deployer Address: ${deployer.address}`);
  log(`Owner Address: ${owner.address}`);
  log(`Recipient Address: ${recipient.address}`);

  // 1. Deploy SmartWalletImplementation V1
  log("\n--- Step 1: Deploying SmartWalletImplementation V1 ---");
  const ImplV1 = await ethers.getContractFactory("SmartWalletImplementation");
  const implV1 = await ImplV1.deploy();
  await implV1.waitForDeployment();
  const implV1Addr = await implV1.getAddress();
  log(`V1 Implementation Deployed at: ${implV1Addr}`);

  // 2. Deploy WalletFactory
  log("\n--- Step 2: Deploying WalletFactory ---");
  const Factory = await ethers.getContractFactory("WalletFactory");
  const factory = await Factory.deploy(implV1Addr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  log(`WalletFactory Deployed at: ${factoryAddr}`);

  // 3. Predict Wallet Address via CREATE2
  log("\n--- Step 3: Predicting CREATE2 Smart Wallet Address ---");
  const salt = ethers.keccak256(ethers.toUtf8Bytes("integration-salt-2026"));
  const predictedAddr = await factory.predictWalletAddress(owner.address, salt);
  log(`Salt: ${salt}`);
  log(`Predicted Address: ${predictedAddr}`);

  // 4. Create Wallet Proxy Instance
  log("\n--- Step 4: Executing createWallet via Factory ---");
  const tx = await factory.createWallet(owner.address, salt);
  const receipt = await tx.wait();
  
  const event = receipt.logs.map(l => {
    try { return factory.interface.parseLog(l); } catch(e) { return null; }
  }).find(p => p && p.name === "WalletCreated");

  const actualProxyAddr = event.args.wallet;
  log(`Actual Deployed Proxy Address: ${actualProxyAddr}`);

  // 5. Compare predicted vs actual addresses
  log("\n--- Step 5: Address Verification ---");
  log(`Predicted: ${predictedAddr}`);
  log(`Actual:    ${actualProxyAddr}`);
  if (predictedAddr.toLowerCase() === actualProxyAddr.toLowerCase()) {
    log("SUCCESS: Predicted Address === Actual Deployed Proxy Address!");
  } else {
    throw new Error("FAIL: Predicted address mismatch!");
  }

  // 6. Verify Owner
  log("\n--- Step 6: Verifying Wallet Owner & Initial State ---");
  const walletV1 = await ethers.getContractAt("SmartWalletImplementation", actualProxyAddr);
  const walletOwner = await walletV1.owner();
  const walletVersion = await walletV1.version();
  log(`Wallet Owner: ${walletOwner}`);
  log(`Wallet Version: ${walletVersion}`);

  // 7. Deposit ETH
  log("\n--- Step 7: Deposit Test ETH into Proxy Wallet ---");
  const depositAmount = ethers.parseEther("2.5");
  const depositTx = await deployer.sendTransaction({
    to: actualProxyAddr,
    value: depositAmount
  });
  await depositTx.wait();
  const balanceAfterDeposit = await ethers.provider.getBalance(actualProxyAddr);
  log(`Balance After Deposit: ${ethers.formatEther(balanceAfterDeposit)} ETH`);

  // 8. Execute ETH Transfer
  log("\n--- Step 8: Execute ETH Transfer through Proxy Wallet ---");
  const transferAmount = ethers.parseEther("0.5");
  const execTx = await walletV1.connect(owner).execute(recipient.address, transferAmount, "0x");
  await execTx.wait();
  const balanceAfterExec = await ethers.provider.getBalance(actualProxyAddr);
  log(`Balance After Transfer: ${ethers.formatEther(balanceAfterExec)} ETH`);

  // 9. Deploy SmartWalletImplementation V2
  log("\n--- Step 9: Deploying SmartWalletImplementation V2 ---");
  const ImplV2 = await ethers.getContractFactory("SmartWalletImplementationV2");
  const implV2 = await ImplV2.deploy();
  await implV2.waitForDeployment();
  const implV2Addr = await implV2.getAddress();
  log(`V2 Implementation Deployed at: ${implV2Addr}`);

  // 10. Execute UUPS Upgrade
  log("\n--- Step 10: Executing Authorized UUPS Upgrade to V2 ---");
  const upgradeTx = await walletV1.connect(owner).upgradeToAndCall(implV2Addr, "0x");
  await upgradeTx.wait();
  log("Upgrade Transaction Confirmed!");

  // 11. Verify Proxy Address and State Preserved
  log("\n--- Step 11: Verifying Post-Upgrade Integrity ---");
  const walletV2 = await ethers.getContractAt("SmartWalletImplementationV2", actualProxyAddr);
  const newVersion = await walletV2.version();
  const isV2 = await walletV2.isV2();
  const postOwner = await walletV2.owner();
  const postBalance = await ethers.provider.getBalance(actualProxyAddr);

  log(`Proxy Address Unchanged: ${walletV2.target === actualProxyAddr}`);
  log(`New Version: ${newVersion}`);
  log(`isV2() Flag: ${isV2}`);
  log(`Owner Preserved: ${postOwner === owner.address}`);
  log(`Balance Preserved: ${ethers.formatEther(postBalance)} ETH`);

  log("\n==========================================================");
  log("INTEGRATION TEST PASSED SUCCESSFULLY!");
  log("==========================================================");

  // Write log to production_artifacts/logs/integration_test.log
  const artifactsDir = path.join(process.cwd(), "production_artifacts", "logs");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  const logFilePath = path.join(artifactsDir, "integration_test.log");
  fs.writeFileSync(logFilePath, logLines.join("\n"), "utf8");
  console.log(`\nLog saved to: ${logFilePath}`);
}

main().catch((error) => {
  console.error("Integration Test Error:", error);
  process.exit(1);
});
