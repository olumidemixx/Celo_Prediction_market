// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiAssetOracle
 * @notice Oracle contract that stores prices for multiple cryptocurrency assets
 * @dev Allows owner to update prices for different assets identified by their symbols
 */
contract MultiAssetOracle is Ownable {
    // Mapping from asset symbol to price (in 8 decimals)
    mapping(string => uint256) private prices;
    
    // Event emitted when a price is updated
    event PriceUpdated(string indexed symbol, uint256 price, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Set price for a single asset
     * @param symbol Asset symbol (e.g., "BTC", "ETH", "SOL", "BNB")
     * @param price Price in 8 decimals (e.g., 96000.00000000 for $96,000)
     */
    function setPrice(string memory symbol, uint256 price) external onlyOwner {
        require(bytes(symbol).length > 0, "Invalid symbol");
        require(price > 0, "Invalid price");
        
        prices[symbol] = price;
        emit PriceUpdated(symbol, price, block.timestamp);
    }
    
    /**
     * @notice Set prices for multiple assets in a single transaction
     * @param symbols Array of asset symbols
     * @param _prices Array of prices corresponding to symbols
     */
    function setPrices(string[] memory symbols, uint256[] memory _prices) external onlyOwner {
        require(symbols.length == _prices.length, "Array length mismatch");
        require(symbols.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < symbols.length; i++) {
            require(bytes(symbols[i]).length > 0, "Invalid symbol");
            require(_prices[i] > 0, "Invalid price");
            
            prices[symbols[i]] = _prices[i];
            emit PriceUpdated(symbols[i], _prices[i], block.timestamp);
        }
    }
    
    /**
     * @notice Read price for a specific asset
     * @param symbol Asset symbol (e.g., "BTC", "ETH", "SOL", "BNB")
     * @return price Price in 8 decimals
     */
    function read(string memory symbol) external view returns (uint256) {
        uint256 price = prices[symbol];
        require(price > 0, "Price not set for asset");
        return price;
    }
    
    /**
     * @notice Get prices for multiple assets
     * @param symbols Array of asset symbols
     * @return _prices Array of prices corresponding to symbols
     */
    function readMultiple(string[] memory symbols) external view returns (uint256[] memory) {
        uint256[] memory _prices = new uint256[](symbols.length);
        
        for (uint256 i = 0; i < symbols.length; i++) {
            _prices[i] = prices[symbols[i]];
            require(_prices[i] > 0, "Price not set for asset");
        }
        
        return _prices;
    }
    
    /**
     * @notice Check if price is set for an asset
     * @param symbol Asset symbol
     * @return bool True if price is set
     */
    function isPriceSet(string memory symbol) external view returns (bool) {
        return prices[symbol] > 0;
    }
}
