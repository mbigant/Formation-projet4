const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const Staking = artifacts.require("./Staking.sol");
const RewardToken = artifacts.require("./RewardToken.sol");
const { expect } = require('chai');

contract("Staking Contract", accounts => {

  const owner = accounts[0];
  const investor = accounts[1];

  let stakingToken, rewardToken, staking, stakeAmount;
  let firstDepositBlockNumber;

  before( async () => {
    rewardToken = await RewardToken.new(new BN(1000000), {from: owner});
    stakingToken = await RewardToken.new(new BN(1000000), {from: owner});
    staking = await Staking.new({from: owner});

    await rewardToken.transfer(staking.address, 1000000);

    await stakingToken.transfer(investor, 100);
    stakeAmount = new BN(100);
  })

  describe('Staking', async() => {

    it("should create pool", async() => {

      const rewardPerBlockAmount = new BN(10);

      const result = await staking.createPool(stakingToken.address, rewardToken.address, rewardPerBlockAmount, rewardToken.address, {from: owner});

      expectEvent(result, 'PoolCreated', {pool: new BN(0)});
    })

    it("investor should have 100 stakingToken", async() => {
      expect(await stakingToken.balanceOf(investor)).to.be.bignumber.equal(new BN(100));
    })

    it('should not be able to stake 0 token', async () => {
      await stakingToken.approve(staking.address, stakeAmount, { from: investor });
      await expectRevert(staking.deposit(0, 0, {from: investor}), 'You must deposit tokens');
    })

    it("should stake successfully", async () => {
      const result = await staking.deposit(0, stakeAmount, {from: investor});
      firstDepositBlockNumber = await time.latestBlock();

      expectEvent(result, 'Staked', {pool: new BN(0), user: investor, amount: stakeAmount});
    })

    it("investor should have 100 Token staked", async () => {
      expect(await staking.getUserBalance(0, investor)).to.be.bignumber.equal(new BN(100));
    })

    it("total staked in pool should be 100", async () => {
      expect(await staking.getPoolBalance(0)).to.be.bignumber.equal(new BN(100));
    })

    it("staking address should have balance of 100", async () => {
      //console.log("balanceOf(staking.address): " + await stakingToken.balanceOf(staking.address))
      expect(await stakingToken.balanceOf(staking.address)).to.be.bignumber.equal(new BN(100));
    })

    it("investor should have an empty balance", async () => {
      //console.log("balanceOf(investor): " + await stakingToken.balanceOf(investor));
      expect(await stakingToken.balanceOf(investor)).to.be.bignumber.equal(new BN(0));
    })

    it("investor should not have any rewards", async () => {
      expect(await staking.getRewardToClaim(0, {from: investor})).to.be.bignumber.equal(new BN(0));
    })
  })

  describe('withdrawing', async() => {
    it('should fail for an account that has not staked', async () => {
      await expectRevert(staking.withdraw(0, 10, { from: owner }), 'Not enough token to widthdraw');

      // Est-ce notmal de mettre à jour le reward après les revert?
      //console.log("after revert withdraw: " + await staking._getRewardPerToken());
    })

    it('should fail if an account tries to withdraw more than they have staked', async () => {
      await expectRevert(staking.withdraw(0, 101, { from: investor }), 'Not enough token to widthdraw');
    })

    it('should advance the block', async() => {
      console.log("before block advanceBlockTo _getRewardPerToken: " + await staking.getRewardToClaim(0));

      const latest = await time.latestBlock();
      console.log(`Current block: ${latest}`);

      await time.advanceBlockTo(parseInt(latest) + 1);

      const current = await time.latestBlock();
      console.log(`Current block: ${current}`);
      assert.equal(current, parseInt(latest) + 1);

      console.log("after block advanceBlockTo _getRewardPerToken: " + await staking.getRewardToClaim(0));
    })

    it('should withdraw successfully', async () => {
      const amount = new BN(50);
      const result = await staking.withdraw(0, amount, {from: investor});

      expectEvent(result, 'Withdrawn', {pool: new BN(0), user: investor, amount: amount});
    })

    it('allows balance of investor to 50', async() => {
      expect(await stakingToken.balanceOf(investor)).to.be.bignumber.equal(new BN(50));
    })

    it('should earn rewardToken', async () => {

      // Pourquoi investor a gagné 40 ? au lieu de 30
      console.log("balanceOf (investor) rewardToken: " + await rewardToken.balanceOf(investor));
    })

    it('should have an empty balance after withdrawing everything', async () => {
      await staking.withdraw(0, new BN(50), {from: investor});
      const blockNumber = await time.latestBlock();
      const expectedReward = (blockNumber - firstDepositBlockNumber) * 10;

      // Je comprends pas trop les balances de investor
      // Pourquoi est-ce qu'il a encore 100 stakingToken après le 2è withdraw => l'investisseur a récupéré ses 100 tokens qui ne sont plus dans le smartContract
      // et le rewardToken en plus => il n'a pas claim directement mais withdraw l'a fait automatiquement
      console.log("balanceOf(investor) stakingToken: " + await stakingToken.balanceOf(investor));
      console.log("balanceOf(investor) rewardToken: " + await rewardToken.balanceOf(investor));
      console.log("totalStaked: "+await staking.getPoolBalance(0));
      console.log("Block number at first deposit: " + firstDepositBlockNumber);
      console.log("Block number after last withdraw: " + blockNumber);
      console.log("Nb Block: " + (blockNumber - firstDepositBlockNumber) );
      console.log("Expected rewards : " + expectedReward );


      expect(expectedReward).to.be.equal(50);
    })


  })


});
