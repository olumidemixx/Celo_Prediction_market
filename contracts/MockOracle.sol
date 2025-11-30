// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract MockOracle {
    uint256 private price;
    
    constructor(uint256 _initialPrice) {
        price = _initialPrice;
    }
    
    function read() external view returns (uint256) {
        return price;
    }
    
    function setPrice(uint256 _newPrice) external {
        price = _newPrice;
    }
}