import React, {Component, Fragment} from "react";
import Web3Context from "../store/web3-context";
import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import {toast, ToastContainer} from 'react-toastify';
import web3 from "web3";

import "../styles/admin.css";
import 'react-toastify/dist/ReactToastify.css';
import DataFeed from "../contracts/DataFeedInterface.json";

class AdminPanel extends Component {

    static contextType = Web3Context;

    state = {

    };

    constructor(props) {
        super(props);

        this.stakingTokenInput = React.createRef();
        this.stakingDataFeedInput = React.createRef();
        this.rewardTokenInput = React.createRef();
        this.rewardDataFeedInput = React.createRef();
        this.rewardPerBlockInput = React.createRef();
    }

    async componentDidMount() {

    }

    isAdmin = () => {
        return this.context.accounts.length > 0 && this.context.accounts[0].toLowerCase() === this.context.owner;
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

    onSubmitHandler = async (e) => {
        e.preventDefault();
        const txPromise = this.context.contract.methods.createPool(
            this.stakingTokenInput.current.value,
            this.rewardTokenInput.current.value,
            web3.utils.toWei(this.rewardPerBlockInput.current.value),
            this.stakingDataFeedInput.current.value,
            this.rewardDataFeedInput.current.value
        ).send({ from: this.context.accounts[0] });

        await this.runTxPromise(txPromise, "Pool created");
    }

    checkDataFeedContract = async (e) => {

        const dataFeedCOntract = new this.context.web3.eth.Contract(
            DataFeed,
            e.target.value,
        );

        try {
            const decimals = await dataFeedCOntract.methods.decimals().call();

            if( parseInt(decimals) !== 8 ) {
                alert('Only 8 decimals datafeed allowed');
                e.target.value = '';
            }

        } catch (err) {
            alert("Invalid datafeed address !")
        }
    }

    render() {

        if( this.isAdmin() ) {
            return (
                <Fragment>
                    <h1>Admin panel</h1>
                    <p>Welcom owner !</p>

                    <h2 className="text-start">Create new Pool</h2>

                    <Container>
                        <Form onSubmit={this.onSubmitHandler.bind(this)}>
                            <Card>
                                <Card.Header as="h6">Staking Token</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control ref={this.stakingTokenInput} type="text" placeholder="ERC20 address" required />
                                                <Form.Label>ERC20 address</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control onChange={this.checkDataFeedContract.bind(this)} ref={this.stakingDataFeedInput} type="text" placeholder="Datafeed address" required />
                                                <Form.Label>Chainlink datafeed address</Form.Label>
                                                <Form.Text className="text-muted">
                                                    Only USD pair (8 decimals)
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            <br/>
                            <Card>
                                <Card.Header as="h6">Reward Token</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control ref={this.rewardTokenInput} type="text" placeholder="ERC20 address" required/>
                                                <Form.Label>ERC20 address</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control onChange={this.checkDataFeedContract.bind(this)} ref={this.rewardDataFeedInput} type="text" placeholder="Datafeed address" required/>
                                                <Form.Label>Chainlink datafeed address</Form.Label>
                                                <Form.Text className="text-muted">
                                                    Only USD pair (8 decimals)
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control ref={this.rewardPerBlockInput} type="number" placeholder="reward rate" required />
                                                <Form.Label>Reward rate</Form.Label>
                                                <Form.Text className="text-muted">
                                                    Number of tokens distributed each block
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            <br/>

                            <Button variant="primary" type="submit">
                                Create pool
                            </Button>
                        </Form>
                        <ToastContainer/>
                    </Container>

                </Fragment>
            );
        }
        else {
            return (
                <Alert variant="danger">
                    <Alert.Heading>You are not allowed</Alert.Heading>
                    <p>
                        Only contract owner authorized here !
                    </p>
                </Alert>
            );
        }
    }
}

export default AdminPanel;