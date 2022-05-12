// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PriceConsumerV3.sol";

contract Staking is Ownable {

    /// List of pool
    Pool[] public pools;

    /// @dev Mapping of Users in a pool
    mapping(uint => mapping(address => User)) private usersInPool;

    /// @dev User who stack
    struct User {
        uint balance;
        uint rewardBalance;
        uint totalClaimedRewards;
        uint rewardPerToken;
    }

    /// @dev Pool details
    struct Pool {
        uint totalStaked;
        uint lastUpdateBlock;
        uint rewardPerToken;
        uint rewardPerBlock;
        IERC20 stakingToken;
        IERC20 rewardToken;
        PriceConsumerV3 rewardTokenDataFeed;
        PriceConsumerV3 stakingTokenDataFeed;
    }

    event PoolCreated(uint pool);
    event Staked(uint indexed pool, address indexed user, uint amount);
    event Withdrawn(uint indexed pool, address indexed user, uint amount);
    event Claimed(uint indexed pool, address indexed user, uint amount);

    /// @dev revert if pool index is not on the Pool[] array
    modifier validPool(uint _poolId) {
        require(_poolId < pools.length, "Pool not found");
        _;
    }

    constructor() {

    }

    /**
     * @dev Create a new pool
     *
     * @param _tokenToStake address of the staked token
     * @param _tokenReward address of the rewarded token
     * @param _rewardPerBlock how much _tokenReward will be distributed per block
     * @param _rewardTokenDataFeedAddress chainlink datafeed address to get the price of the _tokenReward
     *
     * Emit a PoolCreated event
     *
     * Requirements:
     * - `msg.sender` must be the owner
     * - `_tokenToStake` must be a valid address
     * - `_tokenReward` must be a valid address
     * - `_rewardTokenDataFeedAddress` must be a valid address
     * - `_rewardPerBlock` must be greater than zero
     */
    function createPool(address _tokenToStake, address _tokenReward, uint _rewardPerBlock, address _stakingTokenDataFeedAddress, address _rewardTokenDataFeedAddress) external onlyOwner {
        require(_tokenToStake != address(0), "Bad staking token address");
        require(_tokenReward != address(0), "Bad reward token address");
        require(_rewardTokenDataFeedAddress != address(0), "Bad oracle address");
        require(_stakingTokenDataFeedAddress != address(0), "Bad oracle address");
        require(_rewardPerBlock > 0, "Reward rate must be positive");

        pools.push(
            Pool({
                totalStaked : 0,
                lastUpdateBlock : block.number,
                rewardPerBlock : _rewardPerBlock,
                rewardPerToken : 0,
                rewardToken : IERC20(_tokenReward),
                rewardTokenDataFeed: new PriceConsumerV3(_rewardTokenDataFeedAddress),
                stakingToken : IERC20(_tokenToStake),
                stakingTokenDataFeed: new PriceConsumerV3(_stakingTokenDataFeedAddress)
            })
        );

        emit PoolCreated(pools.length - 1);
    }

    /**
     * @dev Deposit some token in the pool _poolId and update the rewards calculation
     * @notice Deposit some tokens in a pool
     *
     * @param _poolId index of the pool in the Pool[] array
     * @param _amount Number of token user want to deposit in the pool
     *
     * Emit a Staked event
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     * - `_amount` must be greater than zero
     * - `msg.sender` must own enough token to deposit
     */
    function deposit(uint _poolId, uint _amount) external validPool(_poolId) {
        require(_amount > 0, "You must deposit tokens");
        require(_amount <= pools[_poolId].stakingToken.balanceOf(msg.sender), "You don't have enough token");

        _updateRewards(_poolId);

        pools[_poolId].totalStaked += _amount;
        usersInPool[_poolId][msg.sender].balance += _amount;

        bool success = pools[_poolId].stakingToken.transferFrom(msg.sender, address(this), _amount);
        assert(success);

        emit Staked(_poolId, msg.sender, _amount);
    }

    /**
     * @dev Withdraw some token from the pool _poolId, update the rewards calculation and claim reward if possible
     * @notice Withdraw some tokens from the pool
     *
     * @param _poolId index of the pool in the Pool[] array
     * @param _amount Number of token user want to withdraw from the pool
     *
     * Emit a Withdrawn event
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     * - `_amount` must be greater than zero
     * - `msg.sender` must have enough token in this pool
     */
    function withdraw(uint _poolId, uint _amount) external validPool(_poolId) {
        require(_amount > 0, "Invalid token amount");
        require(_amount <= usersInPool[_poolId][msg.sender].balance, "Not enough token to widthdraw");

        _updateRewards(_poolId);

        usersInPool[_poolId][msg.sender].balance -= _amount;
        pools[_poolId].totalStaked -= _amount;
        _claimReward(_poolId);

        bool success = pools[_poolId].stakingToken.transfer(msg.sender, _amount);
        assert(success);

        emit Withdrawn(_poolId, msg.sender, _amount);
    }

    /**
     * @dev Claim rewards from the pool _poolId
     * @notice Claim rewards
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     * Emit a Claimed event
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     * - `msg.sender` must have rewards to claim for
     */
    function claim(uint _poolId) external validPool(_poolId) {
        require(usersInPool[_poolId][msg.sender].rewardBalance > 0, "Nothing to claim");

        _updateRewards(_poolId);

        _claimReward(_poolId);
    }

    /**
     * @dev Return the number of claimable tokens from the pool _poolId
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     */
    function getRewardToClaim(uint _poolId) external view validPool(_poolId) returns (uint) {
        return usersInPool[_poolId][msg.sender].rewardBalance;
    }

    /**
     * @dev Update the rewardPerToken of the pool _poolId
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     */
    function _updateRewards(uint _poolId) private {
        pools[_poolId].rewardPerToken = _getRewardPerToken(_poolId);
        pools[_poolId].lastUpdateBlock = block.number;
        usersInPool[_poolId][msg.sender].rewardBalance = _getRewardsEarnedLastPeriod(_poolId);
        usersInPool[_poolId][msg.sender].rewardPerToken = pools[_poolId].rewardPerToken;
    }

    /**
     * @dev Return the result of the earned reward of the user
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     */
    function _getRewardsEarnedLastPeriod(uint _poolId) private view returns (uint) {
        return (usersInPool[_poolId][msg.sender].balance * (pools[_poolId].rewardPerToken - usersInPool[_poolId][msg.sender].rewardPerToken) / 1e18) + usersInPool[_poolId][msg.sender].rewardBalance;
    }

    /**
     * @dev Send the reward amount and reset the balance
     */
    function _claimReward(uint _poolId) private {
        if (usersInPool[_poolId][msg.sender].rewardBalance > 0) {
            uint rewardAmount = usersInPool[_poolId][msg.sender].rewardBalance;
            usersInPool[_poolId][msg.sender].rewardBalance = 0;
            bool success = pools[_poolId].rewardToken.transfer(msg.sender, rewardAmount);
            assert(success);

            emit Claimed(_poolId, msg.sender, rewardAmount);
        }
    }

    /**
     * @dev Return the result of reward per token since the last update
     */
    function _getRewardPerToken(uint _poolId) private view returns (uint) {
        if (pools[_poolId].totalStaked == 0) {
            return pools[_poolId].rewardPerToken;
        }
        else {
            return pools[_poolId].rewardPerToken + (((block.number - pools[_poolId].lastUpdateBlock) * pools[_poolId].rewardPerBlock * 1e18) / pools[_poolId].totalStaked);
        }
    }

    /**
     * @dev Return the user balance of deposited token in the pool _poolId
     *
     * @param _poolId index of the pool in the Pool[] array
     * @param _address user address
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     */
    function getUserBalance(uint _poolId, address _address) external view validPool(_poolId) returns (uint) {
        return usersInPool[_poolId][_address].balance;
    }

    /**
     * @dev Return the total balance of the pool _poolId
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     */
    function getPoolBalance(uint _poolId) external view validPool(_poolId) returns (uint) {
        return pools[_poolId].totalStaked;
    }

    /**
     * @dev Return price of the reward token from the pool _poolId
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     */
    function getRewardPrice(uint _poolId) external view validPool(_poolId) returns (int) {
        return pools[_poolId].rewardTokenDataFeed.getLatestPrice();
    }

    /**
     * @dev Return price of the staking token from the pool _poolId
     *
     * @param _poolId index of the pool in the Pool[] array
     *
     * Requirements:
     * - `_poolId` must exists in the Pool[] array
     */
    function getTokenPrice(uint _poolId) external view validPool(_poolId) returns (int) {
        return pools[_poolId].stakingTokenDataFeed.getLatestPrice();
    }

    // todo garder ? permettrait de savoir si la pool a assez de reward token
    function getRemainingRewards(uint _poolId) external view validPool(_poolId) onlyOwner returns (uint) {
        return pools[_poolId].rewardToken.balanceOf(address(this));
    }

}