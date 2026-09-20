const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

async function main() {
  const { ethers } = hre;
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY is required for Sepolia deployment. Put it in a local .env file only.');
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${hre.network.name}`);

  const Implementation = await ethers.getContractFactory('SmartWalletImplementation');
  const implementation = await Implementation.deploy();
  await implementation.waitForDeployment();
  const implementationAddress = await implementation.getAddress();

  const Factory = await ethers.getContractFactory('WalletFactory');
  const factory = await Factory.deploy(implementationAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  const output = {
    network: hre.network.name,
    chainId: 11155111,
    deployer: deployer.address,
    implementationV1: implementationAddress,
    factory: factoryAddress,
    deployedAt: new Date().toISOString()
  };

  const outputDir = path.join(process.cwd(), 'production_artifacts', 'deployment');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sepolia-deployment.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
