// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SmartWalletImplementation.sol";

/**
 * @title SmartWalletImplementationV2
 * @dev Upgraded implementation contract returning version "v2" and additional utility functions.
 * Preserves 100% storage layout compatibility.
 */
contract SmartWalletImplementationV2 is SmartWalletImplementation {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Overridden version function returning "v2".
     */
    function version() external pure override returns (string memory) {
        return "v2";
    }

    /**
     * @dev New utility function proving upgrade execution.
     */
    function isV2() external pure returns (bool) {
        return true;
    }
}
