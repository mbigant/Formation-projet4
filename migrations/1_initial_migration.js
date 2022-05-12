const web3 = require('web3');

const Staking = artifacts.require("./Staking.sol");
const RewardToken = artifacts.require("./RewardToken.sol");
const DegenToken = artifacts.require("./DegenToken.sol");

module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(RewardToken, web3.utils.toWei('1000000')); // Deploy RewardToken with 1 000 000 supply
  await deployer.deploy(DegenToken, web3.utils.toWei('21000000')); // Deploy DegenToken with 21 000 000 supply
  await deployer.deploy(Staking);

  const rewardERC20 = await RewardToken.deployed();
  const degenERC20 = await DegenToken.deployed();
  const staking = await Staking.deployed();

  await rewardERC20.transfer(staking.address, web3.utils.toWei('1000')) // Sending 1 000 token to staking contract

  await degenERC20.transfer(accounts[1], web3.utils.toWei('1000')) // Sending 1 000 token to other accounts
  await degenERC20.transfer(accounts[2], web3.utils.toWei('1000')) // Sending 1 000 token to other accounts
};