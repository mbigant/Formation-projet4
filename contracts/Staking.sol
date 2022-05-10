// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RewardToken.sol";

contract Staking is Ownable {

    Pool[] public pools;
    mapping(uint => mapping(address => User)) private usersInPool;

    struct User {
        uint balance;
        uint rewardBalance;
        uint totalClaimedRewards;
        uint rewardPerToken;
    }

    struct Pool {
        uint totalStaked;
        uint lastUpdateBlock;
        uint rewardPerToken;
        uint rewardPerBlock;
        IERC20 stakingToken;
        IERC20 rewardToken;
    }

    event PoolCreated(uint pool);
    event Staked(uint indexed pool, address indexed user, uint amount);
    event Withdrawn(uint indexed pool, address indexed user, uint amount);
    event Claimed(uint indexed pool, address indexed user, uint amount);

    constructor() {

    }

    function createPool(address _tokenToStake, address _tokenReward, uint _rewardPerBlock, address _chainlinkDataFeedAddress) external onlyOwner {
        require(_tokenToStake != address(0), "Bad staking token address");
        require(_tokenReward != address(0), "Bad reward token address");
        require(_chainlinkDataFeedAddress != address(0), "Bad oracle address");
        require(_rewardPerBlock > 0, "Reward rate must be positive");

        pools.push(
            Pool({
                totalStaked : 0,
                lastUpdateBlock : block.number,
                rewardPerBlock : _rewardPerBlock,
                rewardPerToken : 0,
                stakingToken : IERC20(_tokenToStake),
                rewardToken : IERC20(_tokenReward)
            })
        );

        emit PoolCreated(pools.length - 1);
    }

    function deposit(uint _poolId, uint _amount) external {
        require(_amount > 0, "You must deposit tokens");
        require(_poolId < pools.length, "Pool not found");
        require(_amount <= pools[_poolId].stakingToken.balanceOf(msg.sender), "You don't have enough token");

        _updateRewards(_poolId);

        pools[_poolId].totalStaked += _amount;
        usersInPool[_poolId][msg.sender].balance += _amount;

        bool success = pools[_poolId].stakingToken.transferFrom(msg.sender, address(this), _amount);
        assert(success);

        emit Staked(_poolId, msg.sender, _amount);
    }

    function withdraw(uint _poolId, uint _amount) external {
        require(_poolId < pools.length, "Pool not found");
        require(_amount <= usersInPool[_poolId][msg.sender].balance, "Not enough token to widthdraw");

        _updateRewards(_poolId);

        usersInPool[_poolId][msg.sender].balance -= _amount;
        pools[_poolId].totalStaked -= _amount;
        _claimReward(_poolId);

        bool success = pools[_poolId].stakingToken.transfer(msg.sender, _amount);
        assert(success);

        emit Withdrawn(_poolId, msg.sender, _amount);
    }

    function claim(uint _poolId) external {
        require(_poolId < pools.length, "Pool not found");
        require(usersInPool[_poolId][msg.sender].rewardBalance > 0, "Nothing to claim");
        _claimReward(_poolId);
    }

    function getRewardToClaim(uint _poolId) external view returns (uint) {
        require(_poolId < pools.length, "Pool not found");
        return usersInPool[_poolId][msg.sender].rewardBalance;
    }

    function _updateRewards(uint _poolId) private {
        pools[_poolId].rewardPerToken = _getRewardPerToken(_poolId);
        pools[_poolId].lastUpdateBlock = block.number;
        usersInPool[_poolId][msg.sender].rewardBalance = _getRewardsEarnedLastPeriod(_poolId);
        usersInPool[_poolId][msg.sender].rewardPerToken = pools[_poolId].rewardPerToken;
    }

    function _getRewardsEarnedLastPeriod(uint _poolId) private view returns (uint) {
        return (usersInPool[_poolId][msg.sender].balance * (pools[_poolId].rewardPerToken - usersInPool[_poolId][msg.sender].rewardPerToken) / 1e18) + usersInPool[_poolId][msg.sender].rewardBalance;
    }

    function _claimReward(uint _poolId) private {
        if (usersInPool[_poolId][msg.sender].rewardBalance > 0) {
            uint rewardAmount = usersInPool[_poolId][msg.sender].rewardBalance;
            usersInPool[_poolId][msg.sender].rewardBalance = 0;
            bool success = pools[_poolId].rewardToken.transfer(msg.sender, rewardAmount);
            assert(success);

            emit Claimed(_poolId, msg.sender, rewardAmount);
        }
    }

    function _getRewardPerToken(uint _poolId) private view returns (uint) {
        if (pools[_poolId].totalStaked == 0) {
            return pools[_poolId].rewardPerToken;
        }
        else {
            return pools[_poolId].rewardPerToken + (((block.number - pools[_poolId].lastUpdateBlock) * pools[_poolId].rewardPerBlock * 1e18) / pools[_poolId].totalStaked);
        }
    }

    function getRemainingRewards(uint _poolId) external view returns (uint) {
        return pools[_poolId].rewardToken.balanceOf(address(this));
    }

    function getUpdatedRewardPerToken(uint _poolId) external returns (uint) {
        _updateRewards(_poolId);
        return pools[_poolId].rewardPerToken;
    }

    function getUserBalance(uint _poolId, address _address) external view returns (uint) {
        return usersInPool[_poolId][_address].balance;
    }

    function getPoolBalance(uint _poolId) external view returns (uint) {
        return pools[_poolId].totalStaked;
    }
}