// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionRound.sol";

contract MarketManager is Ownable {
    address public immutable roundImplementation;
    address public feeCollector;
    
    struct Market {
        string coin;
        bytes32 feedId;
        address currentRound;
        address[] roundHistory;
        bool initialized;
        bool paused;
    }
    
    mapping(string => Market) public markets;
    string[] public marketList;
    
    // Events
    event MarketInitialized(string indexed coin, bytes32 feedId);
    event RoundCreated(string indexed coin, address roundAddress, uint256 strikePrice);
    event RoundSettled(string indexed coin, address roundAddress);
    event MarketPaused(string indexed coin);
    event MarketUnpaused(string indexed coin);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    
    constructor(address _roundImplementation, address _feeCollector) Ownable(msg.sender) {
        require(_roundImplementation != address(0), "Invalid implementation");
        require(_feeCollector != address(0), "Invalid fee collector");
        
        roundImplementation = _roundImplementation;
        feeCollector = _feeCollector;
    }
    
    /**
     * @notice Initialize a new market for a cryptocurrency
     * @param _coin Cryptocurrency symbol (BTC, ETH, SOL, BNB)
     * @param _feedId RedStone feed ID for the coin
     */
    function initializeMarket(string memory _coin, bytes32 _feedId) external onlyOwner {
        require(!markets[_coin].initialized, "Market already initialized");
        require(bytes(_coin).length > 0, "Invalid coin");
        require(_feedId != bytes32(0), "Invalid feed ID");
        
        markets[_coin] = Market({
            coin: _coin,
            feedId: _feedId,
            currentRound: address(0),
            roundHistory: new address[](0),
            initialized: true,
            paused: false
        });
        
        marketList.push(_coin);
        
        emit MarketInitialized(_coin, _feedId);
    }
    
    /**
     * @notice Create a new round for a market
     * @param _coin Cryptocurrency symbol
     */
    function createRound(string memory _coin) public returns (address) {
        Market storage market = markets[_coin];
        require(market.initialized, "Market not initialized");
        require(!market.paused, "Market is paused");
        require(market.currentRound == address(0), "Round already active");
        
        // Clone the implementation
        address clone = Clones.clone(roundImplementation);
        
        // Initialize the new round
        PredictionRound(clone).initialize(_coin, market.feedId);
        
        // Update market state
        market.currentRound = clone;
        market.roundHistory.push(clone);
        
        // Get strike price for event
        uint256 strikePrice = PredictionRound(clone).strikePrice();
        
        emit RoundCreated(_coin, clone, strikePrice);
        
        return clone;
    }
    
    /**
     * @notice Settle current round and create next one immediately
     * @param _coin Cryptocurrency symbol
     */
    function settleAndCreateNext(string memory _coin) public {
        Market storage market = markets[_coin];
        require(market.initialized, "Market not initialized");
        require(market.currentRound != address(0), "No active round");
        
        address currentRoundAddress = market.currentRound;
        PredictionRound currentRound = PredictionRound(currentRoundAddress);
        
        // Settle the current round
        require(block.timestamp >= currentRound.endTime(), "Round not ended");
        require(!currentRound.settled(), "Already settled");
        
        currentRound.settle();
        emit RoundSettled(_coin, currentRoundAddress);
        
        // Clear current round
        market.currentRound = address(0);
        
        // Create next round immediately (always, regardless of pool balance)
        createRound(_coin);
    }
    
    /**
     * @notice Get current active round for a market
     * @param _coin Cryptocurrency symbol
     */
    function getCurrentRound(string memory _coin) external view returns (address) {
        return markets[_coin].currentRound;
    }
    
    /**
     * @notice Get round history for a market
     * @param _coin Cryptocurrency symbol
     */
    function getRoundHistory(string memory _coin) external view returns (address[] memory) {
        return markets[_coin].roundHistory;
    }
    
    /**
     * @notice Get market information
     * @param _coin Cryptocurrency symbol
     */
    function getMarketInfo(string memory _coin) external view returns (
        bytes32 feedId,
        address currentRound,
        uint256 roundCount,
        bool initialized,
        bool paused
    ) {
        Market storage market = markets[_coin];
        return (
            market.feedId,
            market.currentRound,
            market.roundHistory.length,
            market.initialized,
            market.paused
        );
    }
    
    /**
     * @notice Get all market symbols
     */
    function getAllMarkets() external view returns (string[] memory) {
        return marketList;
    }
    
    /**
     * @notice Pause a market (prevents new rounds)
     * @param _coin Cryptocurrency symbol
     */
    function pauseMarket(string memory _coin) external onlyOwner {
        require(markets[_coin].initialized, "Market not initialized");
        require(!markets[_coin].paused, "Already paused");
        
        markets[_coin].paused = true;
        emit MarketPaused(_coin);
    }
    
    /**
     * @notice Unpause a market
     * @param _coin Cryptocurrency symbol
     */
    function unpauseMarket(string memory _coin) external onlyOwner {
        require(markets[_coin].initialized, "Market not initialized");
        require(markets[_coin].paused, "Not paused");
        
        markets[_coin].paused = false;
        emit MarketUnpaused(_coin);
    }
    
    /**
     * @notice Update fee collector address
     * @param _newCollector New fee collector address
     */
    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }
    
    /**
     * @notice Clear current round reference for a settled round (recovery function)
     * @param _coin Cryptocurrency symbol
     */
    function clearSettledRound(string memory _coin) external {
        Market storage market = markets[_coin];
        require(market.initialized, "Market not initialized");
        require(market.currentRound != address(0), "No active round");
        
        address currentRoundAddress = market.currentRound;
        PredictionRound currentRound = PredictionRound(currentRoundAddress);
        
        // Only allow clearing if the round is actually settled and ended
        require(currentRound.settled(), "Round not settled");
        require(block.timestamp >= currentRound.endTime(), "Round not ended");
        
        // Clear the current round reference
        market.currentRound = address(0);
        
        emit RoundSettled(_coin, currentRoundAddress);
    }
    
    /**
     * @notice Settle all expired rounds and create new ones
     */
    function settleAllExpiredRounds() external {
        for (uint256 i = 0; i < marketList.length; i++) {
            string memory coin = marketList[i];
            Market storage market = markets[coin];
            
            if (market.initialized && !market.paused && market.currentRound != address(0)) {
                PredictionRound currentRound = PredictionRound(market.currentRound);
                
                if (block.timestamp >= currentRound.endTime() && !currentRound.settled()) {
                    settleAndCreateNext(coin);
                }
            }
        }
    }
}
