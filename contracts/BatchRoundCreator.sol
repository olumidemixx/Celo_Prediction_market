// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IMarketManager {
    function createRound(string memory _coin) external returns (address);
}

contract BatchRoundCreator {
    IMarketManager public marketManager;

    constructor(address _marketManager) {
        marketManager = IMarketManager(_marketManager);
    }

    function createBatchRounds(string[] calldata markets) external {
        for (uint256 i = 0; i < markets.length; i++) {
            marketManager.createRound(markets[i]);
        }
    }
}
