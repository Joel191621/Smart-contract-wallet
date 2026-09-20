// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./SmartWalletImplementation.sol";

/**
 * @title WalletFactory
 * @dev Factory contract deploying deterministic ERC1967 Proxy wallets using CREATE2.
 */
contract WalletFactory {
    address public immutable implementation;

    mapping(address => address[]) public walletsOf;
    mapping(address => bool) public isWallet;
    mapping(address => mapping(bytes32 => bool)) public deploymentExists;

    event WalletCreated(
        address indexed wallet,
        address indexed owner,
        bytes32 indexed salt
    );

    constructor(address _implementation) {
        require(_implementation != address(0), "WalletFactory: implementation zero address");
        implementation = _implementation;
    }

    /**
     * @dev Predicts the deterministic CREATE2 address for a wallet proxy before deployment.
     * @param owner Address of the wallet owner.
     * @param salt Unique deployment salt.
     */
    function predictWalletAddress(
        address owner,
        bytes32 salt
    ) public view returns (address) {
        bytes memory initData = abi.encodeWithSelector(
            SmartWalletImplementation.initialize.selector,
            owner
        );
        bytes memory initCode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implementation, initData)
        );
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(initCode)
            )
        );
        return address(uint160(uint256(hash)));
    }

    /**
     * @dev Deploys a deterministic Smart Wallet proxy instance via CREATE2.
     * @param owner EOA address of the wallet owner.
     * @param salt Unique deployment salt.
     */
    function createWallet(
        address owner,
        bytes32 salt
    ) external returns (address proxy) {
        return _createWalletInternal(owner, salt);
    }

    /**
     * @dev Batch deploys multiple wallet proxy instances.
     * @param owners Array of wallet owner addresses.
     * @param salts Array of unique deployment salts.
     */
    function batchCreateWallets(
        address[] calldata owners,
        bytes32[] calldata salts
    ) external returns (address[] memory proxies) {
        require(owners.length == salts.length, "WalletFactory: length mismatch");
        proxies = new address[](owners.length);
        for (uint256 i = 0; i < owners.length; i++) {
            proxies[i] = _createWalletInternal(owners[i], salts[i]);
        }
        return proxies;
    }

    /**
     * @dev Returns primary deployed wallet address for owner.
     */
    function getWallet(address owner) external view returns (address) {
        if (walletsOf[owner].length == 0) return address(0);
        return walletsOf[owner][0];
    }

    /**
     * @dev Internal helper executing CREATE2 deployment and registration.
     */
    function _createWalletInternal(address owner, bytes32 salt) internal returns (address proxyAddress) {
        require(owner != address(0), "WalletFactory: owner zero address");
        require(!deploymentExists[owner][salt], "WalletFactory: wallet already deployed for owner and salt");

        bytes memory initData = abi.encodeWithSelector(
            SmartWalletImplementation.initialize.selector,
            owner
        );

        address predicted = predictWalletAddress(owner, salt);

        ERC1967Proxy proxy = new ERC1967Proxy{salt: salt}(implementation, initData);
        proxyAddress = address(proxy);

        require(proxyAddress == predicted, "WalletFactory: predicted address mismatch");

        deploymentExists[owner][salt] = true;
        walletsOf[owner].push(proxyAddress);
        isWallet[proxyAddress] = true;

        emit WalletCreated(proxyAddress, owner, salt);
        return proxyAddress;
    }
}
