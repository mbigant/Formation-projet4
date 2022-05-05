var Staking = artifacts.require("./Staking.sol");
var RewardToken = artifacts.require("./RewardToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(RewardToken, 1000000).then( () => {
    deployer.deploy(Staking, RewardToken.address, RewardToken.address); // todo address du token a staker etc
  });
};