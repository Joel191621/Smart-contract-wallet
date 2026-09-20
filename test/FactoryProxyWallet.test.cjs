const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory + ERC1967 Proxy + UUPS Smart Wallet Architecture", function () {
  let implementationV1;
  let implementationV2;
  let factory;
  let owner;
  let alice;
  let bob;
  let unauthorizedUser;

  const sampleSalt = ethers.keccak256(ethers.toUtf8Bytes("salt-123"));
  const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

  beforeEach(async function () {
    [owner, alice, bob, unauthorizedUser] = await ethers.getSigners();

    // 1. Deploy SmartWalletImplementation V1
    const ImplementationV1Contract = await ethers.getContractFactory("SmartWalletImplementation");
    implementationV1 = await ImplementationV1Contract.deploy();
    await implementationV1.waitForDeployment();

    // 2. Deploy SmartWalletImplementation V2
    const ImplementationV2Contract = await ethers.getContractFactory("SmartWalletImplementationV2");
    implementationV2 = await ImplementationV2Contract.deploy();
    await implementationV2.waitForDeployment();

    // 3. Deploy WalletFactory
    const FactoryContract = await ethers.getContractFactory("WalletFactory");
    factory = await FactoryContract.deploy(await implementationV1.getAddress());
    await factory.waitForDeployment();
  });

  it("1. Implementation cannot be initialized directly because _disableInitializers() is active", async function () {
    await expect(
      implementationV1.initialize(owner.address)
    ).to.be.revertedWithCustomError(implementationV1, "InvalidInitialization");
  });

  it("2 & 3. Proxy initializes successfully and cannot be initialized twice", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);

    const wallet = await ethers.getContractAt("SmartWalletImplementation", predictedAddr);
    expect(await wallet.owner()).to.equal(alice.address);

    await expect(
      wallet.initialize(bob.address)
    ).to.be.revertedWithCustomError(wallet, "InvalidInitialization");
  });

  it("4. Correct owner is assigned after deployment", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);
    const wallet = await ethers.getContractAt("SmartWalletImplementation", predictedAddr);

    expect(await wallet.owner()).to.equal(alice.address);
  });

  it("5. predictWalletAddress() exactly matches the actual CREATE2 proxy address", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    
    const tx = await factory.createWallet(alice.address, sampleSalt);
    const receipt = await tx.wait();

    const event = receipt.logs.map(log => {
      try {
        return factory.interface.parseLog(log);
      } catch (e) {
        return null;
      }
    }).find(parsed => parsed && parsed.name === "WalletCreated");

    expect(event).to.not.be.null;
    const actualProxyAddress = event.args.wallet;

    expect(predictedAddr).to.equal(actualProxyAddress);
  });

  it("6. Duplicate deployment for the same owner + salt is rejected", async function () {
    await factory.createWallet(alice.address, sampleSalt);

    await expect(
      factory.createWallet(alice.address, sampleSalt)
    ).to.be.revertedWith("WalletFactory: wallet already deployed for owner and salt");
  });

  it("7. ETH can be received by the proxy wallet", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);

    const depositAmount = ethers.parseEther("1.5");
    await owner.sendTransaction({
      to: predictedAddr,
      value: depositAmount
    });

    const balance = await ethers.provider.getBalance(predictedAddr);
    expect(balance).to.equal(depositAmount);
  });

  it("8. ETH can be sent/executed through the proxy wallet by the owner", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);
    const wallet = await ethers.getContractAt("SmartWalletImplementation", predictedAddr);

    // Fund wallet
    await owner.sendTransaction({
      to: predictedAddr,
      value: ethers.parseEther("2.0")
    });

    const recipientInitBal = await ethers.provider.getBalance(bob.address);
    const transferValue = ethers.parseEther("0.5");

    // Execute transfer connecting as owner Alice
    await wallet.connect(alice).execute(bob.address, transferValue, "0x");

    const recipientFinalBal = await ethers.provider.getBalance(bob.address);
    expect(recipientFinalBal - recipientInitBal).to.equal(transferValue);
  });

  it("9. Unauthorized wallet operations are rejected", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);
    const wallet = await ethers.getContractAt("SmartWalletImplementation", predictedAddr);

    await expect(
      wallet.connect(unauthorizedUser).execute(bob.address, 0, "0x")
    ).to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
  });

  it("10. Unauthorized UUPS upgrade is rejected", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);
    const wallet = await ethers.getContractAt("SmartWalletImplementation", predictedAddr);

    const v2Address = await implementationV2.getAddress();

    await expect(
      wallet.connect(unauthorizedUser).upgradeToAndCall(v2Address, "0x")
    ).to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
  });

  it("11, 12, 13, 16, 17, 18. Authorized owner can upgrade V1 -> V2 while proxy address, state, owner & balance remain intact", async function () {
    const predictedAddr = await factory.predictWalletAddress(alice.address, sampleSalt);
    await factory.createWallet(alice.address, sampleSalt);

    const walletV1 = await ethers.getContractAt("SmartWalletImplementation", predictedAddr);

    // Fund wallet & update state
    const depositAmount = ethers.parseEther("3.0");
    await owner.sendTransaction({
      to: predictedAddr,
      value: depositAmount
    });

    // Check V1 version
    expect(await walletV1.version()).to.equal("v1");

    // Execute UUPS upgrade connecting as owner Alice
    const v2Address = await implementationV2.getAddress();
    await walletV1.connect(alice).upgradeToAndCall(v2Address, "0x");

    // Verify Proxy Address remains unchanged
    expect(walletV1.target).to.equal(predictedAddr);

    // Verify contract logic is now V2
    const walletV2 = await ethers.getContractAt("SmartWalletImplementationV2", predictedAddr);
    expect(await walletV2.version()).to.equal("v2");
    expect(await walletV2.isV2()).to.equal(true);

    // Verify wallet state remains intact
    expect(await walletV2.owner()).to.equal(alice.address);
    expect(await ethers.provider.getBalance(predictedAddr)).to.equal(depositAmount);
  });

  it("14 & 15. batchCreateWallets() works and multiple users receive different deterministic addresses", async function () {
    const owners = [alice.address, bob.address];
    const salts = [
      ethers.keccak256(ethers.toUtf8Bytes("batch-1")),
      ethers.keccak256(ethers.toUtf8Bytes("batch-2"))
    ];

    const predicted1 = await factory.predictWalletAddress(owners[0], salts[0]);
    const predicted2 = await factory.predictWalletAddress(owners[1], salts[1]);

    expect(predicted1).to.not.equal(predicted2);

    await factory.batchCreateWallets(owners, salts);

    const wallet1 = await ethers.getContractAt("SmartWalletImplementation", predicted1);
    const wallet2 = await ethers.getContractAt("SmartWalletImplementation", predicted2);

    expect(await wallet1.owner()).to.equal(alice.address);
    expect(await wallet2.owner()).to.equal(bob.address);
    expect(await factory.isWallet(predicted1)).to.equal(true);
    expect(await factory.isWallet(predicted2)).to.equal(true);
  });
});
