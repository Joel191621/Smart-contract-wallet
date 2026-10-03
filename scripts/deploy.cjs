const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("==========================================================");
  console.log("SEPOLIA DEPLOYMENT: SMART WALLET FACTORY & IMPLEMENTATION");
  console.log("==========================================================");

  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  console.log(`Target Network Chain ID: ${chainId}`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Address: ${deployer.address}`);

  // 1. Deploy SmartWalletImplementation V1
  console.log("\n1. Deploying SmartWalletImplementation V1...");
  const ImplementationFactory = await ethers.getContractFactory("SmartWalletImplementation");
  const implementation = await ImplementationFactory.deploy();
  await implementation.waitForDeployment();
  const implAddress = await implementation.getAddress();
  console.log(`✓ SmartWalletImplementation V1 Deployed at: ${implAddress}`);

  // 2. Deploy WalletFactory
  console.log("\n2. Deploying WalletFactory...");
  const FactoryContract = await ethers.getContractFactory("WalletFactory");
  const factory = await FactoryContract.deploy(implAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`✓ WalletFactory Deployed at: ${factoryAddress}`);

  console.log("\n==========================================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("==========================================================");
  console.log(`Chain ID:               ${chainId}`);
  console.log(`Deployer EOA:           ${deployer.address}`);
  console.log(`Implementation (V1):    ${implAddress}`);
  console.log(`WalletFactory:          ${factoryAddress}`);
  console.log("==========================================================");
  console.log("Add the following to your .env file:");
  console.log(`VITE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("==========================================================");
}

main().catch((error) => {
  console.error("Deployment Error:", error);
  process.exit(1);
});
