const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const Staking = artifacts.require("./Staking.sol");
const RewardToken = artifacts.require("./RewardToken.sol");
const MockPriceFeed = artifacts.require('MockV3Aggregator');
const { expect } = require('chai');

contract("Staking Contract", accounts => {

  const owner = accounts[0];
  const investor_1 = accounts[1];
  const investor_2 = accounts[2];

  let stakingToken, rewardToken, staking, stakeAmount;
  let firstDepositBlockNumberForInvestor1;
  let firstDepositBlockNumberForInvestor2InPool1;
  let firstDepositBlockNumberForInvestor2InPool2;
  
  let mockPriceFeed;
  const price = "2000000000000000000"

  before( async () => {
    mockPriceFeed = await MockPriceFeed.new(18, price);
    rewardToken = await RewardToken.new(new BN(1000000), {from: owner});
    stakingToken = await RewardToken.new(new BN(1000000), {from: owner});
    staking = await Staking.new({from: owner});

    await rewardToken.transfer(staking.address, 1000000);

    await stakingToken.transfer(investor_1, 100);
    await stakingToken.transfer(investor_2, 100);
    stakeAmount = new BN(100);
  })

  //Staking : 1 investor in 1 pool
  describe('Staking', async() => {

    it("should create pool", async() => {

      const rewardPerBlockAmount = new BN(10);

      const result = await staking.createPool(stakingToken.address, rewardToken.address, rewardPerBlockAmount, mockPriceFeed.address, mockPriceFeed.address, {from: owner});

      expectEvent(result, 'PoolCreated', {pool: new BN(0)});
    })

    it('returns Token price', async () => {
      expect(await staking.getTokenPrice(0)).to.be.bignumber.equal(new BN(price));
    })

    it('returns RewardToken price', async () => {
      expect(await staking.getRewardPrice(0)).to.be.bignumber.equal(new BN(price));
    })

    it("investor_1 should have 100 stakingToken", async() => {
      expect(await stakingToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(100));
    })

    it('should not be able to stake 0 token', async () => {
      await stakingToken.approve(staking.address, stakeAmount, { from: investor_1 });
      await expectRevert(staking.deposit(0, 0, {from: investor_1}), 'You must deposit tokens');
    })

    it("should stake successfully", async () => {
      const result = await staking.deposit(0, stakeAmount, {from: investor_1});
      firstDepositBlockNumberForInvestor1 = await time.latestBlock();

      expectEvent(result, 'Staked', {pool: new BN(0), user: investor_1, amount: stakeAmount});
    })

    it("investor_1 should have 100 Token staked", async () => {
      expect(await staking.getUserBalance(0, investor_1)).to.be.bignumber.equal(new BN(100));
    })

    it("total staked in pool should be 100", async () => {
      expect(await staking.getPoolBalance(0)).to.be.bignumber.equal(new BN(100));
    })

    it("staking address should have balance of 100", async () => {
      //console.log("balanceOf(staking.address): " + await stakingToken.balanceOf(staking.address))
      expect(await stakingToken.balanceOf(staking.address)).to.be.bignumber.equal(new BN(100));
    })

    it("investor_1 should have an empty balance", async () => {
      //console.log("balanceOf(investor_1): " + await stakingToken.balanceOf(investor_1));
      expect(await stakingToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(0));
    })

    it("investor_1 should not have any rewards", async () => {
      expect(await staking.getRewardToClaim(0, {from: investor_1})).to.be.bignumber.equal(new BN(0));
    })
  })

  describe('withdrawing', async() => {
    it('should fail for an account that has not staked', async () => {
      await expectRevert(staking.withdraw(0, 10, { from: owner }), 'Not enough token to widthdraw');
    })

    it('should fail if an account tries to withdraw more than they have staked', async () => {
      await expectRevert(staking.withdraw(0, 101, { from: investor_1 }), 'Not enough token to widthdraw');
    })

    it('should advance the block', async() => {

      const latest = await time.latestBlock();
      //console.log(`Current block: ${latest}`);

      await time.advanceBlockTo(parseInt(latest) + 1);

      const current = await time.latestBlock();
      //console.log(`Current block: ${current}`);
      assert.equal(current, parseInt(latest) + 1);
    })

    it('should withdraw successfully', async () => {
      const amount = new BN(50);
      const result = await staking.withdraw(0, amount, {from: investor_1});

      expectEvent(result, 'Withdrawn', {pool: new BN(0), user: investor_1, amount: amount});
    })

    it('balance of investor_1 should be 50', async() => {
      expect(await stakingToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(50));
    })

    it('should earn rewardToken', async () => {
      const blockNumber = await time.latestBlock();
      const expectedReward = (blockNumber - firstDepositBlockNumberForInvestor1) * 10;
      expect(await rewardToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(expectedReward));
    })

    it('should withdrawing everything', async () => {
      await staking.withdraw(0, new BN(50), {from: investor_1});
      const blockNumber = await time.latestBlock();
      const expectedReward = (blockNumber - firstDepositBlockNumberForInvestor1) * 10;

      expect( await stakingToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(100));
      expect(await rewardToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(expectedReward));
      expect(await staking.getPoolBalance(0)).to.be.bignumber.equal(new BN(0));
      //console.log("balanceOf(investor_1) stakingToken: " + await stakingToken.balanceOf(investor_1));
      //console.log("balanceOf(investor_1) rewardToken: " + await rewardToken.balanceOf(investor_1));
      //console.log("totalStaked: "+await staking.getPoolBalance(0));
      // console.log("Block number at first deposit: " + firstDepositBlockNumberForInvestor1);
      // console.log("Block number after last withdraw: " + blockNumber);
      // console.log("Nb Block: " + (blockNumber - firstDepositBlockNumberForInvestor1) );
      // console.log("Expected rewards : " + expectedReward );


      // expect(expectedReward).to.be.equal(50);
    })


  })

  // Staking in 2 pools
  describe('Staking in 2 pools with 2 investors', async() => {
    
    it("should create pool 2", async() => {

      const rewardPerBlockAmount = new BN(10);

      const result = await staking.createPool(stakingToken.address, rewardToken.address, rewardPerBlockAmount, mockPriceFeed.address, mockPriceFeed.address, {from: owner});

      expectEvent(result, 'PoolCreated', {pool: new BN(1)});
    })

    it("investor_1 should have 100 stakingToken", async() => {
      expect(await stakingToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(100));
    })

    it("investor_2 should have 100 stakingToken", async() => {
      expect(await stakingToken.balanceOf(investor_2)).to.be.bignumber.equal(new BN(100));
    })

    it("investor_1 should stake 100 successfully in first pool", async () => {
      await stakingToken.approve(staking.address, stakeAmount, { from: investor_1 });
      const result = await staking.deposit(0, stakeAmount, {from: investor_1});
      firstDepositBlockNumberForInvestor1 = await time.latestBlock();

      expect(await stakingToken.balanceOf(investor_1)).to.be.bignumber.equal(new BN(0));
      expect(await staking.getUserBalance(0, investor_1)).to.be.bignumber.equal(new BN(100));
      expect(await staking.getPoolBalance(0)).to.be.bignumber.equal(new BN(100));

      expectEvent(result, 'Staked', {pool: new BN(0), user: investor_1, amount: stakeAmount});
    })    

    it("investor_2 should stake 50 successfully in first pool", async () => {
      await stakingToken.approve(staking.address, 50, { from: investor_2 });
      const result = await staking.deposit(0, 50, {from: investor_2});
      firstDepositBlockNumberForInvestor2InPool1 = await time.latestBlock();

      expect(await stakingToken.balanceOf(investor_2)).to.be.bignumber.equal(new BN(50));
      expect(await staking.getUserBalance(0, investor_2)).to.be.bignumber.equal(new BN(50));
      expect(await staking.getPoolBalance(0)).to.be.bignumber.equal(new BN(150));

      expectEvent(result, 'Staked', {pool: new BN(0), user: investor_2, amount: new BN(50)});
    })
    
    it("investor_2 should stake 50 successfully in second pool", async () => {
      await stakingToken.approve(staking.address, 50, { from: investor_2 });
      const result = await staking.deposit(1, 50, {from: investor_2});
      firstDepositBlockNumberForInvestor2InPool2 = await time.latestBlock();

      expect(await stakingToken.balanceOf(investor_2)).to.be.bignumber.equal(new BN(0));
      expect(await staking.getUserBalance(1, investor_2)).to.be.bignumber.equal(new BN(50));
      expect(await staking.getPoolBalance(1)).to.be.bignumber.equal(new BN(50));
      
      expectEvent(result, 'Staked', {pool: new BN(1), user: investor_2, amount: new BN(50)});
    })

    it('should advance the block', async() => {

      const latest = await time.latestBlock();

      await time.advanceBlockTo(parseInt(latest) + 1);

      const current = await time.latestBlock();
      assert.equal(current, parseInt(latest) + 1);
    })
    
 
    it('should withdraw and earn rewardToken', async () => {
      
      let rewardTokenBalanceOfInvestor1 = await rewardToken.balanceOf(investor_1);

      // Withdraw in first pool
      await staking.withdraw(0, new BN(100), {from: investor_1});

      await staking.withdraw(0, new BN(50), {from: investor_2});

      rewardTokenBalanceOfInvestor1 = rewardTokenBalanceOfInvestor1.add(new BN(46));
      expect(await rewardToken.balanceOf(investor_1)).to.be.bignumber.equal(rewardTokenBalanceOfInvestor1);
      
      let rewardTokenBalanceOfInvestor2 = await rewardToken.balanceOf(investor_2);
      expect(await rewardTokenBalanceOfInvestor2).to.be.bignumber.equal(new BN(23));

      // Withdraw in second pool
      await staking.withdraw(1, new BN(50), {from: investor_2});

      rewardTokenBalanceOfInvestor2 = rewardTokenBalanceOfInvestor2.add(new BN(40));
      expect(await rewardToken.balanceOf(investor_2)).to.be.bignumber.equal(new BN(rewardTokenBalanceOfInvestor2));
    })
   })

});
