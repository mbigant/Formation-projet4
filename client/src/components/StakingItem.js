import React, {Component} from "react";
import {Badge, Container, Navbar, Button, Card} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import '../styles/StakingItem.css';


class StakingItem extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {

    }

    componentDidUpdate(prevProps, prevState) {
        
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
                    <Card.Header>Staking ETH</Card.Header>
                    <Card.Body>
                        <Card.Text>APY : 100%</Card.Text>
                        <Card.Text>Reward Token : RWT</Card.Text>
                        <Card.Text>Your Stake : 0</Card.Text>
                        <Button variant="primary">Approve</Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

}

export default StakingItem;