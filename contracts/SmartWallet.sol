// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SmartWallet
 * @dev Production-ready Smart Contract Wallet controlled by an EOA Owner.
 * Compiles cleanly with 0 errors or warnings on Solidity ^0.8.20.
 */
contract SmartWallet {
    address public owner;
    uint256 public nonce;

    bytes4 internal constant EIP1271_MAGIC_VALUE = 0x1626ba7e;

    event Received(address indexed sender, uint256 amount);
    event ExecutionSuccess(address indexed target, uint256 value, bytes data);
    event ExecutionFailure(address indexed target, uint256 value, bytes data, string reason);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "SmartWallet: caller is not the owner");
        _;
    }

    /**
     * @dev Constructor sets the initial owner of the smart wallet.
     * @param _owner Address of the EOA owner/signer.
     */
    constructor(address _owner) {
        require(_owner != address(0), "SmartWallet: owner cannot be zero address");
        owner = _owner;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @dev Accepts ETH deposits.
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Fallback to accept plain ETH transfers.
     */
    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Executes transactions/transfers called directly by owner EOA.
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external payable onlyOwner returns (bytes memory result) {
        require(address(this).balance >= value, "SmartWallet: insufficient wallet balance");

        (bool success, bytes memory returnData) = target.call{value: value}(data);

        if (success) {
            emit ExecutionSuccess(target, value, data);
        } else {
            string memory reason = _getRevertReason(returnData);
            emit ExecutionFailure(target, value, data, reason);
            revert(string(abi.encodePacked("SmartWallet: execution failed - ", reason)));
        }

        return returnData;
    }

    /**
     * @dev Executes transaction with owner off-chain signature payload.
     */
    function executeSigned(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 _nonce,
        bytes calldata signature
    ) external payable returns (bytes memory result) {
        require(_nonce == nonce, "SmartWallet: invalid execution nonce");
        require(address(this).balance >= value, "SmartWallet: insufficient wallet balance");

        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), block.chainid, target, value, data, _nonce)
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address signer = _recoverSigner(ethSignedMessageHash, signature);
        require(signer == owner, "SmartWallet: invalid owner signature");

        nonce++;

        (bool success, bytes memory returnData) = target.call{value: value}(data);

        if (success) {
            emit ExecutionSuccess(target, value, data);
        } else {
            string memory reason = _getRevertReason(returnData);
            emit ExecutionFailure(target, value, data, reason);
            revert(string(abi.encodePacked("SmartWallet: signed execution failed - ", reason)));
        }

        return returnData;
    }

    /**
     * @dev Validates EIP-1271 signatures for contract wallets.
     */
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue) {
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        address recovered = _recoverSigner(ethSignedMessageHash, signature);
        if (recovered == owner) {
            return EIP1271_MAGIC_VALUE;
        } else {
            return 0xffffffff;
        }
    }

    /**
     * @dev Transfers ownership of the smart contract wallet.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SmartWallet: new owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Returns current ETH balance.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function _recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) {
            return address(0);
        }
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) {
            return address(0);
        }
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function _getRevertReason(bytes memory returnData) internal pure returns (string memory) {
        if (returnData.length < 68) return "Transaction reverted without reason";
        assembly {
            returnData := add(returnData, 0x04)
        }
        return abi.decode(returnData, (string));
    }
}
