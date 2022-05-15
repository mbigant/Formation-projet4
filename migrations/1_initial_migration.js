const web3 = require('web3');

const Staking = artifacts.require("./Staking.sol");
const RewardToken = artifacts.require("./RewardToken.sol");
const DegenToken = artifacts.require("./DegenToken.sol");
const RektToken = artifacts.require("./RektToken.sol");

module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(RewardToken, web3.utils.toWei('10000000')); // Deploy RewardToken with 10 000 000 supply
  await deployer.deploy(RektToken, web3.utils.toWei('1000000')); // Deploy DegenToken with 1 000 000 supply
  await deployer.deploy(DegenToken, web3.utils.toWei('1000000')); // Deploy DegenToken with 1 000 000 supply
  await deployer.deploy(Staking);

  const rewardERC20 = await RewardToken.deployed();
  const degenERC20 = await DegenToken.deployed();
  const rektERC20 = await RektToken.deployed();
  const staking = await Staking.deployed();

  await rewardERC20.transfer(staking.address, web3.utils.toWei('1000000')) // Sending 1 000 000 token to staking contract

  // Sending 1 000 token of each ERC20 to some accounts
  for( let i = 1; i <= 3; i ++ ) {
    await degenERC20.transfer(accounts[i], web3.utils.toWei('1000'));
    await rektERC20.transfer(accounts[i], web3.utils.toWei('1000'));
  }
};