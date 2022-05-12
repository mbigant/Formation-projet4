import React, {Component} from "react";
import {Button, Card} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import '../styles/StakingItem.css';
import ERC20Contract from "../contracts/ERC20.json";
import web3 from "web3";


class StakingItem extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);

        this.state = {
            currentUser: null,
            rewardTokenSymbol: null,
            stakingTokenSymbol: null,
            userBalanceInPool: 0,
            userBalanceInWallet: 0,
        }
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

        const erc20RewardInstance = new this.context.web3.eth.Contract(
            ERC20Contract.abi,
            this.props.pool.rewardToken,
        );

        const erc20StakingInstance = new this.context.web3.eth.Contract(
            ERC20Contract.abi,
            this.props.pool.stakingToken,
        );

        const stakingSymbol = await erc20StakingInstance.methods.symbol().call();
        const rewardSymbol = await erc20RewardInstance.methods.symbol().call();
        const userBalanceInPool = await this.context.contract.methods.getUserBalance(this.props.pool.id, userAccount).call();
        const userBalanceInWalletInWei = await erc20StakingInstance.methods.balanceOf(userAccount).call();

        let userBalanceInWallet = 0;
        if( userBalanceInWalletInWei > 0 ) {
            userBalanceInWallet = web3.utils.fromWei(userBalanceInWalletInWei.toString());
        }

        this.setState({rewardTokenSymbol: rewardSymbol, stakingTokenSymbol: stakingSymbol, userBalanceInPool, userBalanceInWallet});
    }

    runApprove = () => {

    }

    runStake = () => {

    }

    runClaim = () => {

    }

    runWithdraw = () => {
        
    }

    render() {

        return (
            <div className="staking-item">
                <Card style={{ width: '18rem' }}>
                    <Card.Header>Staking {this.state.stakingTokenSymbol}</Card.Header>
                    <Card.Body>
                        <Card.Text>APY : 100%</Card.Text>
                        <Card.Text>Reward Token : {this.state.rewardTokenSymbol}</Card.Text>
                        <Card.Text>Your Stake : {this.state.userBalanceInPool}</Card.Text>
                        <Card.Text>Wallet : {this.state.userBalanceInWallet}</Card.Text>
                        <Button variant="primary">Approve</Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

}

export default StakingItem;