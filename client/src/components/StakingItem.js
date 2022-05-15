import React, {Component} from "react";
import {Button, Card, Col, Row, Stack, Tab, Tabs} from "react-bootstrap";
import {toast, ToastContainer} from 'react-toastify';
import Web3Context from "../store/web3-context";
import ERC20Contract from "../contracts/ERC20.json";
import web3 from "web3";

import '../styles/StakingItem.css';
import 'react-toastify/dist/ReactToastify.css';
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

const nfUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    roundingIncrement: 5
});

class StakingItem extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);

        this.state = {
            currentUser: null,
            rewardTokenSymbol: null,
            stakingTokenSymbol: null,
            userBalanceInPool: 0, // value in Wei
            userBalanceInWallet: 0, // value in Wei
            userAllowance: 0, // value in Wei
            depositAmount: 0, // value in Wei
            isValidAmount: false,
            pendingRewards: 0,
            tlv: 0,
            tlvUSD: 0,
            tokenPriceUSD: 0,
            rewardPriceUSD: 0,
            apr: null
        }

        this.depositAmountInput = React.createRef();

        this.blockTimer = setInterval(
            () => this.getPendingReward(),
            1000
        );
    }

    componentDidMount = async () => {

        this.setState({currentUser: this.context.accounts[0]});
        this.loadUserData(this.context.accounts[0]);

    }

    componentDidUpdate(prevProps, prevState) {
        if( prevState.currentUser && prevState.currentUser !== this.context.accounts[0] ) {
            console.log('user changed')
            this.setState({currentUser: this.context.accounts[0]});
            this.loadUserData(this.state.currentUser);
        }
    }

    async getPendingReward() {

        const rewards = await this.context.contract.methods.getPendingReward(this.props.pool.id).call({from: this.state.currentUser});

        this.setState({
            pendingRewards: Math.round(parseFloat(web3.utils.fromWei(rewards)) * 100) / 100
        });
    }

    getAverageBlockTime = async (blockCount) => {
        const blockNumber = await this.context.web3.eth.getBlockNumber();
        const firstBlock = await this.context.web3.eth.getBlock(blockNumber - blockCount);
        let prevTimestamp = firstBlock.timestamp;
        const timestampHistory = [];

        for( let i = firstBlock.number + 1; i < firstBlock.number + blockCount; i++ ) {
            const curBlock = await this.context.web3.eth.getBlock(i);
            timestampHistory.push( curBlock.timestamp - prevTimestamp );
            prevTimestamp = curBlock.timestamp;
        }

        return Math.round(timestampHistory.reduce((a, b) => a + b) / timestampHistory.length);
    }

    loadUserData = async ( userAccount ) => {

        const erc20RewardInstance = this.getRewardTokenContract();
        const erc20StakingInstance = this.getStakingTokenContract();

        const stakingSymbol = await erc20StakingInstance.methods.symbol().call();
        const rewardSymbol = await erc20RewardInstance.methods.symbol().call();
        const userBalanceInPool = await this.context.contract.methods.getUserBalance(this.props.pool.id, userAccount).call();
        const userBalanceInWallet = await erc20StakingInstance.methods.balanceOf(userAccount).call();
        const userAllowance = await erc20StakingInstance.methods.allowance(userAccount, this.context.contract._address).call();
        const tlv = await this.context.contract.methods.getPoolBalance(this.props.pool.id).call();
        const tokenPrice = await this.context.contract.methods.getTokenPrice(this.props.pool.id).call();
        const rewardPrice = await this.context.contract.methods.getRewardPrice(this.props.pool.id).call();

        const tokenPriceUSD = parseFloat(tokenPrice)/100000000; // 8 decimal on USD chainlink datafeed
        const rewardPriceUSD = parseFloat(rewardPrice)/100000000;
        const tlvUSD = parseFloat(web3.utils.fromWei(tlv))  * tokenPriceUSD

        this.getAPR( rewardPriceUSD, tlvUSD ); // keep this async

        this.setState({
            rewardTokenSymbol: rewardSymbol,
            stakingTokenSymbol: stakingSymbol,
            userAllowance,
            userBalanceInPool,
            userBalanceInWallet,
            tlv,
            tlvUSD,
            tokenPriceUSD: nfUSD.format(tokenPriceUSD),
            rewardPriceUSD,
        });
    }

    getAPR = async ( rewardPriceUSD, tlvUSD ) => {

        const blockTime = await this.getAverageBlockTime(20);

        const nbBlockPerYear = 365 * 24 * 60 * 60 / blockTime;
        const rewardPerBlock = parseFloat(web3.utils.fromWei(this.props.pool.rewardPerBlock));
        const blockEarning = rewardPerBlock * rewardPriceUSD;
        const earningPerYear = nbBlockPerYear * blockEarning;
        const apr = earningPerYear / tlvUSD;
        const aprTxt = new Intl.NumberFormat("en-US", {
            style: "percent",
            maximumFractionDigits: 0,
        }).format(apr)

        this.setState({apr: aprTxt})
    }

    getStakingTokenContract = () => {
        return new this.context.web3.eth.Contract(
            ERC20Contract.abi,
            this.props.pool.stakingToken,
        );
    }

    getRewardTokenContract = () => {
        return new this.context.web3.eth.Contract(
            ERC20Contract.abi,
            this.props.pool.rewardToken,
        );
    }

    runTxPromise = (promise, successMessage) => {
        return toast.promise(
            promise,
            {
                pending: 'Waiting for transaction',
                success: successMessage,
                error: 'Transaction error'
            }
        )
    }

    runApprove = async (amount) => {
        const txPromise = this.getStakingTokenContract().methods.approve(this.context.contract._address, amount).send({from: this.state.currentUser});
        const resp = await this.runTxPromise(txPromise, "Ready to deposit");

        if( resp.status ) {
            this.loadUserData(this.state.currentUser);
        }
    }

    runStake = async (amount) => {
        const txPromise = this.context.contract.methods.deposit(this.props.pool.id, amount).send({from: this.state.currentUser});
        const resp = await this.runTxPromise(txPromise, "Succes ! Let's earn money !");

        if( resp.status ) {
            this.loadUserData(this.state.currentUser);
        }
    }

    runClaim = async () => {
        const txPromise = this.context.contract.methods.claim(this.props.pool.id).send({from: this.state.currentUser});
        const resp = await this.runTxPromise(txPromise, "Rewards juste lend into your wallet !");

        if( resp.status ) {
            this.loadUserData(this.state.currentUser);
        }
    }

    runWithdraw = async (amount) => {
        const txPromise = this.context.contract.methods.withdraw(this.props.pool.id, amount).send({from: this.state.currentUser});
        const resp = await this.runTxPromise(txPromise, "Successfully withdrawn");

        if( resp.status ) {
            this.loadUserData(this.state.currentUser);
        }
    }

    render() {

        const claimUsdValue = (this.state.pendingRewards && this.state.rewardPriceUSD) ? parseFloat(this.state.pendingRewards) * this.state.rewardPriceUSD : 0;

        return (
            <Col className="staking-item">
                <Card>
                    <Card.Header>Staking {this.state.stakingTokenSymbol}</Card.Header>
                    <Card.Body>
                        <Row className="mb-2">
                            <Col className="">
                                <Stack gap={0} className="p-2 bg-light border">
                                    <strong className="font-weight-bold">TLV</strong>
                                    <div className="">{this.state.tlv ? web3.utils.fromWei(this.state.tlv) : 0} {this.state.stakingTokenSymbol} <span className="text-muted">({nfUSD.format(this.state.tlvUSD)})</span></div>
                                </Stack>
                            </Col>
                            <Col className="">
                                <Stack gap={0} className="p-2 bg-light border">
                                    <strong className="font-weight-bold">APR 🔥</strong>
                                    <div className="">{this.state.apr}</div>
                                </Stack>
                            </Col>
                            <Col className="">
                                <Stack gap={0} className="p-2 bg-light border">
                                    <strong className="font-weight-bold">Reward</strong>
                                    <div className="">{this.state.rewardTokenSymbol}</div>
                                </Stack>
                            </Col>
                        </Row>

                        <Row className="mb-2">
                            <Col className="" xs>
                                <div className="bg-light border p-2">
                                    <Row>
                                        <Col className="d-flex justify-content-start text-muted">
                                            Balance
                                        </Col>
                                        <Col className="d-flex justify-content-end">
                                            {this.state.userBalanceInPool ? web3.utils.fromWei(this.state.userBalanceInPool) : 0} {this.state.stakingTokenSymbol}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex justify-content-start text-muted">
                                            Wallet
                                        </Col>
                                        <Col className="d-flex justify-content-end">
                                            {this.state.userBalanceInWallet ? web3.utils.fromWei(this.state.userBalanceInWallet) : 0} {this.state.stakingTokenSymbol}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex justify-content-start text-muted">
                                            Rewards
                                        </Col>
                                        <Col className="d-flex justify-content-end">
                                            {this.state.pendingRewards} {this.state.rewardTokenSymbol} &nbsp;<span className="text-muted">({nfUSD.format(claimUsdValue)})</span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="">
                                            { this.state.pendingRewards > 0 && this.state.rewardTokenSymbol && <Button onClick={this.runClaim.bind(this)} variant="outline-success" size={"sm"}>Claim {this.state.pendingRewards} {this.state.rewardTokenSymbol} </Button> }
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>

                        <Tabs defaultActiveKey="deposit" className="mb-3">
                            <Tab eventKey="deposit" title="Deposit">
                                <Deposit
                                    userAllowance={this.state.userAllowance}
                                    userBalanceInWallet={this.state.userBalanceInWallet}
                                    onApproveRequested={this.runApprove.bind(this)}
                                    onDepositeRequested={this.runStake.bind(this)}
                                />
                            </Tab>
                            <Tab eventKey="withdraw" title="Withdraw">
                                <Withdraw
                                    userBalanceInPool={this.state.userBalanceInPool}
                                    onWithdrawRequested={this.runWithdraw.bind(this)}
                                />
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
                <ToastContainer />
            </Col>
        );
    }

}

export default StakingItem;