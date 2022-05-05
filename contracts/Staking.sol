// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RewardToken.sol";

contract Staking is Ownable {

    uint constant BLOCK_DISTRIBUTION = 10; // todo valeure arbitraire, à définir

    uint public totalStaked;
    uint private lastUpdateBlock;
    uint private rewardPerToken;

    mapping( address => User ) private users;

    // todo gérer pool
    IERC20 private rewardToken;
    IERC20 private stakingToken;

    struct User {
        uint balance;
        uint rewardBalance;
        uint totalClaimedRewards;
        uint rewardPerToken;
    }

    constructor( address _rewardToken, address _stakingToken ) {
        rewardToken = IERC20(_rewardToken);
        stakingToken = IERC20(_stakingToken);
    }

//    constructor() {
//        rewardToken = new MBToken(1000000);
//        stakingToken = IERC20(0xd9145CCE52D386f254917e481eB44e9943F39138);
//    }

    function createPool( address _tokenToStake, address _tokenReward, uint _rewardRate ) external onlyOwner {
        //todo
    }

    function deposit( uint _amount ) external {
        require( _amount > 0, "You must deposit tokens");
        require( _amount <= stakingToken.balanceOf(msg.sender), "You don't have enough token");

        _updateRewards();

        totalStaked += _amount;
        users[msg.sender].balance += _amount;

        bool success = stakingToken.transferFrom(msg.sender, address(this), _amount);
        assert(success);
    }

    function withdraw( uint _amount ) external {
        require(_amount <= users[msg.sender].balance, "Not enough token to widthdraw");

        _updateRewards();

        users[msg.sender].balance -= _amount;
        totalStaked -= _amount;
        _claimReward();

        bool success = stakingToken.transfer( msg.sender, _amount );
        assert(success);
    }

    function claim() external {
        require(users[msg.sender].rewardBalance > 0, "Nothing to claim");
        _claimReward();
    }

    function getRewardToClaim() external view returns (uint) {
        return users[msg.sender].rewardBalance;
    }

    function _updateRewards() internal {
        rewardPerToken = _getRewardPerToken();
        lastUpdateBlock = block.number;
        users[msg.sender].rewardBalance = _getRewardsEarnedLastPeriod();
        users[msg.sender].rewardPerToken = rewardPerToken;
    }

    function _getRewardsEarnedLastPeriod() private view returns (uint) {
        return ( users[msg.sender].balance * ( rewardPerToken - users[msg.sender].rewardPerToken ) / 1e18 ) + users[msg.sender].rewardBalance;
    }

    function _claimReward() internal {
        if( users[msg.sender].rewardBalance > 0 ) {
            uint rewardAmount = users[msg.sender].rewardBalance;
            users[msg.sender].rewardBalance = 0;
            bool success = rewardToken.transfer(msg.sender, rewardAmount);
            assert(success);
        }
    }

    function _getRewardPerToken() private view returns(uint) {
        if( totalStaked == 0 ) {
            return rewardPerToken;
        }
        else {
            return rewardPerToken + (((block.number - lastUpdateBlock) * BLOCK_DISTRIBUTION * 1e18) / totalStaked );
        }
    }

    function getRemainingRewards() external view returns (uint) {
        return rewardToken.balanceOf(address(this));
    }

    function getUpdatedRewardPerToken() external returns (uint) {
        _updateRewards();
        return rewardPerToken;
    }
}