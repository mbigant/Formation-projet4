import React, {Component} from "react";
import {Badge, Button, Card, Col, Form, InputGroup} from "react-bootstrap";
import {toast, ToastContainer} from 'react-toastify';
import Web3Context from "../store/web3-context";
import ERC20Contract from "../contracts/ERC20.json";
import web3 from "web3";

import '../styles/StakingItem.css';
import 'react-toastify/dist/ReactToastify.css';


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
        }

        this.depositAmountInput = React.createRef();
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

    loadUserData = async ( userAccount ) => {

        const erc20RewardInstance = this.getRewardTokenContract();
        const erc20StakingInstance = this.getStakingTokenContract();

        const stakingSymbol = await erc20StakingInstance.methods.symbol().call();
        const rewardSymbol = await erc20RewardInstance.methods.symbol().call();
        const userBalanceInPool = await this.context.contract.methods.getUserBalance(this.props.pool.id, userAccount).call();
        const userBalanceInWallet = await erc20StakingInstance.methods.balanceOf(userAccount).call();
        const userAllowance = await erc20StakingInstance.methods.allowance(userAccount, this.context.contract._address).call();

        this.setState({
            rewardTokenSymbol: rewardSymbol,
            stakingTokenSymbol: stakingSymbol,
            userAllowance,
            userBalanceInPool,
            userBalanceInWallet,
        });
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

    depositAmountInputHandler = (e) => {
        const val = e.target.value;
        if( val > 0 ) {
            this.setState({depositAmount: web3.utils.toWei(val.toString()), isValidAmount: true})
        }
        else {
            this.setState({depositAmount: 0, isValidAmount: false})
        }
    }

    useMaxDepositHandler = (e) => {
        const val = web3.utils.fromWei(this.state.userBalanceInWallet);
        this.depositAmountInput.current.value = val;
        this.setState({depositAmount: val})
    }

    requestDeposit = async (e) => {
        e.preventDefault();

        this.setState({depositLoading: true});

        if( web3.utils.toBN(this.state.userAllowance).lt(web3.utils.toBN(this.state.depositAmount)) ) {
            // need approval before deposit
            await this.runApprove();
        }
        else {
            // go deposit
            await this.runStake();
        }
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

    runApprove = async () => {
        const txPromise = this.getStakingTokenContract().methods.approve(this.context.contract._address, this.state.depositAmount).send({from: this.state.currentUser});
        const resp = await this.runTxPromise(txPromise, "Tokens approved");

        if( resp.status ) {
            this.loadUserData(this.state.currentUser);
        }
    }

    runStake = async () => {
        const txPromise = this.context.contract.methods.deposit(this.props.pool.id, this.state.depositAmount).send({from: this.state.currentUser});
        const resp = await this.runTxPromise(txPromise, "Succes ! Let's earn money !");

        if( resp.status ) {
            this.loadUserData(this.state.currentUser);
        }
    }

    runClaim = () => {

    }

    runWithdraw = () => {
        
    }

    render() {

        const approveNeeded = web3.utils.toBN(this.state.userAllowance).lt(web3.utils.toBN(this.state.depositAmount));

        return (
            <Col className="staking-item">
                <Card>
                    <Card.Header>Staking {this.state.stakingTokenSymbol}</Card.Header>
                    <Card.Body>
                        <Card.Text>APY : <Badge bg="success">100%</Badge></Card.Text>
                        <Card.Text>Reward Token : {this.state.rewardTokenSymbol}</Card.Text>
                        <Card.Text>Your Stake : {this.state.userBalanceInPool ? web3.utils.fromWei(this.state.userBalanceInPool) : 0}</Card.Text>
                        <Card.Text>Wallet : {this.state.userBalanceInWallet ? web3.utils.fromWei(this.state.userBalanceInWallet) : 0}</Card.Text>
                        <Form onSubmit={this.requestDeposit.bind(this)}>
                            <Form.Group className="mb-3 text-end form-floating">
                                <InputGroup>
                                    <Button onClick={this.useMaxDepositHandler.bind(this)} variant="outline-secondary">Max</Button>
                                    <Form.Control ref={this.depositAmountInput} onChange={this.depositAmountInputHandler.bind(this)} type="number" min="O" placeholder="Deposit amount" required />
                                </InputGroup>
                            </Form.Group>
                            <div className="d-grid">
                                { approveNeeded
                                    ?
                                    <Button variant="outline-primary" type="submit" disabled={!this.state.isValidAmount}>
                                        Approve
                                    </Button>
                                    :
                                    <Button variant="primary" type="submit" disabled={!this.state.isValidAmount}>
                                        Deposit
                                    </Button>
                                }
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
                <ToastContainer />
            </Col>
        );
    }

}

export default StakingItem;