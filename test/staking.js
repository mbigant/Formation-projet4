const { BN } = require('@openzeppelin/test-helpers');
const Staking = artifacts.require("./Staking.sol");
const RewardToken = artifacts.require("./RewardToken.sol");


contract("Staking", accounts => {

  const owner = accounts[0];

  it("todo...", async () => {

    const rewardTokenInstance = await RewardToken.new(new BN(1000000), {from: owner});

    console.log(rewardTokenInstance.address);

    const instance = await Staking.new(rewardTokenInstance.address, rewardTokenInstance.address, {from: owner});
    //const instance = await Staking.new({from: accounts[0]});

    console.log(instance.address)

    // todo
  });
});
