// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

interface IRedstoneOracle {
    function read(string memory symbol) external view returns (uint256);
}

contract PredictionRound is Initializable {
    using Address for address payable;
    
    // State variables
    string public coin;
    bytes32 public feedId;
    uint256 public strikePrice;
    uint256 public startTime;
    uint256 public entryDeadline;
    uint256 public endTime;
    
    uint256 public totalPool;
    mapping(address => uint256) public userStakes;
    mapping(address => bool) public userPredictions; // true = above, false = below
    mapping(address => bool) public hasClaimed;
    address[] public participants;
    
    address public constant REDSTONE_ORACLE = 0x3841f920A0Ee56Bb75e7D5150ca31Bd641979d1a;
    address public constant FEE_COLLECTOR = 0x2C77747Eb7fecdC1247B5D60e26BD34bB12411EB;
    
    uint256 public constant FEE_PERCENT = 2;
    uint256 public constant ENTRY_DURATION = 240; // 4 minutes
    uint256 public constant TOTAL_DURATION = 300; // 5 minutes (4 min entry + 1 min round)
    
    bool public settled;
    bool public aboveWins;
    bool public isDraw;
    uint256 public finalPrice;
    
    // Events
    event EntryPlaced(address indexed user, bool above, uint256 amount, uint256 afterFee);
    event RoundSettled(uint256 finalPrice, bool aboveWins, bool isDraw);
    event Claimed(address indexed user, uint256 amount);
    event EmergencyRefund(address indexed user, uint256 amount);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initialize a new prediction round
     * @param _coin Cryptocurrency symbol (BTC, ETH, SOL, BNB)
     * @param _feedId RedStone feed ID for the coin
     */
    function initialize(
        string memory _coin,
        bytes32 _feedId
    ) external initializer {
        require(bytes(_coin).length > 0, "Invalid coin");
        
        coin = _coin;
        feedId = _feedId;
        startTime = block.timestamp;
        entryDeadline = startTime + ENTRY_DURATION;
        endTime = startTime + TOTAL_DURATION;
        
        // Capture strike price from oracle
        try IRedstoneOracle(REDSTONE_ORACLE).read(_coin) returns (uint256 price) {
            require(price > 0, "Invalid strike price");
            strikePrice = price;
        } catch {
            revert("Oracle read failed");
        }
    }
    
    /**
     * @notice Enter the prediction round
     * @param above True to bet ABOVE strike price, false for BELOW
     */
    function enter(bool above) external payable {
        require(block.timestamp <= entryDeadline, "Entry period ended");
        require(msg.value > 0, "Must send CELO");
        require(!settled, "Round already settled");
        
        // Calculate fee (2%)
        uint256 fee = (msg.value * FEE_PERCENT) / 100;
        uint256 amountAfterFee = msg.value - fee;
        
        // Send fee to collector immediately
        if (fee > 0) {
            payable(FEE_COLLECTOR).sendValue(fee);
        }
        
        // Record stake for new participant
        if (userStakes[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        
        // Record stake and prediction
        userStakes[msg.sender] += amountAfterFee;
        userPredictions[msg.sender] = above;
        totalPool += amountAfterFee;
        
        emit EntryPlaced(msg.sender, above, msg.value, amountAfterFee);
    }
    
    /**
     * @notice Settle the round after end time and automatically distribute rewards
     */
    function settle() external {
        require(block.timestamp >= endTime, "Round not ended");
        require(!settled, "Already settled");
        
        settled = true;
        
        // Get final price from oracle
        try IRedstoneOracle(REDSTONE_ORACLE).read(coin) returns (uint256 price) {
            require(price > 0, "Invalid final price");
            finalPrice = price;
            
            // Determine winner
            if (finalPrice > strikePrice) {
                aboveWins = true;
                isDraw = false;
            } else if (finalPrice < strikePrice) {
                aboveWins = false;
                isDraw = false;
            } else {
                isDraw = true;
            }
            
            emit RoundSettled(finalPrice, aboveWins, isDraw);
            
            // Automatically distribute rewards to winners
            _distributeRewards();
            
        } catch {
            // Oracle failed - allow emergency refunds
            isDraw = true;
            emit RoundSettled(0, false, true);
        }
    }
    
    /**
     * @notice Claim winnings or refund
     * @dev This function is for manual claiming if auto-distribution failed
     */
    function claim() external {
        require(settled, "Round not settled");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        uint256 userStake = userStakes[msg.sender];
        require(userStake > 0, "No stake found");
        
        uint256 payout;
        
        if (isDraw) {
            // Refund scenario - return original stake
            payout = userStake;
        } else {
            // Check if user is a winner
            bool userPrediction = userPredictions[msg.sender];
            
            // Check if user predicted correctly
            if ((aboveWins && userPrediction) || (!aboveWins && !userPrediction)) {
                // User is a winner - calculate their share of the pool
                uint256 totalWinningStakes = getTotalWinningStakes();
                
                if (totalWinningStakes > 0) {
                    // Calculate winner's percentage of total winning stakes
                    uint256 winnerPercentage = (userStake * 1e18) / totalWinningStakes;
                    // Calculate winner's share of the entire pool
                    payout = (totalPool * winnerPercentage) / 1e18;
                }
            }
            // If user predicted wrong, they get nothing (loser)
        }
        
        require(payout > 0, "No payout available");
        hasClaimed[msg.sender] = true;
        
        payable(msg.sender).sendValue(payout);
        emit Claimed(msg.sender, payout);
    }
    
    /**
     * @notice Emergency refund if oracle fails before settlement
     */
    function emergencyRefund() external {
        require(!settled, "Round already settled");
        require(block.timestamp >= endTime + 5 minutes, "Wait 5 minutes after end");
        
        uint256 userStake = userStakes[msg.sender];
        require(userStake > 0, "No stake to refund");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        hasClaimed[msg.sender] = true;
        userStakes[msg.sender] = 0;
        
        payable(msg.sender).sendValue(userStake);
        emit EmergencyRefund(msg.sender, userStake);
    }
    
    /**
     * @notice Get the total stakes from winning predictions
     */
    function getTotalWinningStakes() public view returns (uint256) {
        uint256 totalWinningStakes = 0;
        
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            if ((aboveWins && userPredictions[participant]) || (!aboveWins && !userPredictions[participant])) {
                totalWinningStakes += userStakes[participant];
            }
        }
        
        return totalWinningStakes;
    }
    
    /**
     * @notice Get the winning pool amount
     */
    function getWinningPool() public view returns (uint256) {
        return totalPool;
    }
    
    /**
     * @notice Get all participants in the round
     */
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    /**
     * @notice Get participant count
     */
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }
    
    /**
     * @notice Automatically distribute rewards to all winners
     * @dev Losers' stakes are shared with winners based on their percentage of total winning stakes
     */
    function _distributeRewards() internal {
        if (isDraw) {
            // In case of draw, refund all participants
            for (uint256 i = 0; i < participants.length; i++) {
                address participant = participants[i];
                if (!hasClaimed[participant] && userStakes[participant] > 0) {
                    uint256 refundAmount = userStakes[participant];
                    hasClaimed[participant] = true;
                    payable(participant).sendValue(refundAmount);
                    emit Claimed(participant, refundAmount);
                }
            }
        } else {
            // Calculate total winning and losing stakes
            uint256 totalWinningStakes = getTotalWinningStakes();
            uint256 totalLosingStakes = totalPool - totalWinningStakes;
            
            if (totalWinningStakes > 0 && totalLosingStakes > 0) {
                // Winners share the entire pool (their stakes + losers' stakes)
                for (uint256 i = 0; i < participants.length; i++) {
                    address participant = participants[i];
                    if (!hasClaimed[participant] && userStakes[participant] > 0) {
                        bool userPrediction = userPredictions[participant];
                        
                        // Check if participant is a winner
                        if ((aboveWins && userPrediction) || (!aboveWins && !userPrediction)) {
                            uint256 userStake = userStakes[participant];
                            // Calculate winner's percentage of total winning stakes
                            uint256 winnerPercentage = (userStake * 1e18) / totalWinningStakes;
                            // Calculate winner's share of the entire pool
                            uint256 payout = (totalPool * winnerPercentage) / 1e18;
                            
                            hasClaimed[participant] = true;
                            payable(participant).sendValue(payout);
                            emit Claimed(participant, payout);
                        }
                        // Losers get nothing - their stakes are distributed to winners
                    }
                }
            } else if (totalWinningStakes > 0) {
                // Edge case: all participants are winners (no losers)
                for (uint256 i = 0; i < participants.length; i++) {
                    address participant = participants[i];
                    if (!hasClaimed[participant] && userStakes[participant] > 0) {
                        bool userPrediction = userPredictions[participant];
                        
                        if ((aboveWins && userPrediction) || (!aboveWins && !userPrediction)) {
                            uint256 refundAmount = userStakes[participant];
                            hasClaimed[participant] = true;
                            payable(participant).sendValue(refundAmount);
                            emit Claimed(participant, refundAmount);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * @notice Get comprehensive round information
     */
    function getRoundInfo() external view returns (
        string memory _coin,
        uint256 _strikePrice,
        uint256 _finalPrice,
        uint256 _startTime,
        uint256 _entryDeadline,
        uint256 _endTime,
        uint256 _totalPool,
        bool _settled,
        bool _aboveWins,
        bool _isDraw
    ) {
        return (
            coin,
            strikePrice,
            finalPrice,
            startTime,
            entryDeadline,
            endTime,
            totalPool,
            settled,
            aboveWins,
            isDraw
        );
    }
    
    /**
     * @notice Get user's stake information
     */
    function getUserStake(address user) external view returns (
        uint256 _userStake,
        bool _userPrediction,
        bool _claimed
    ) {
        return (
            userStakes[user],
            userPredictions[user],
            hasClaimed[user]
        );
    }
}
