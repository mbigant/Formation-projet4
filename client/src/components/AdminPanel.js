import React, {Component, Fragment} from "react";
import Web3Context from "../store/web3-context";
import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import {toast, ToastContainer} from 'react-toastify';

import "../styles/admin.css";
import 'react-toastify/dist/ReactToastify.css';

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

    onSubmitHandler = async () => {

        const txPromise = this.context.contract.methods.createPool(
            this.stakingTokenInput.current.value,
            this.rewardTokenInput.current.value,
            this.rewardPerBlockInput.current.value,
            this.stakingDataFeedInput.current.value,
            this.rewardDataFeedInput.current.value
        ).send({ from: this.context.accounts[0] });

        const response = await this.runTxPromise(txPromise, "Pool created");
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
                                                <Form.Control ref={this.stakingDataFeedInput} type="text" placeholder="Datafeed address" />
                                                <Form.Label>Chainlink datafeed address</Form.Label>
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
                                                <Form.Control ref={this.rewardTokenInput} type="text" placeholder="ERC20 address" />
                                                <Form.Label>ERC20 address</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control ref={this.rewardDataFeedInput} type="text" placeholder="Datafeed address" />
                                                <Form.Label>Chainlink datafeed address</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group className="mb-3 text-start form-floating">
                                                <Form.Control ref={this.rewardPerBlockInput} type="number" placeholder="reward rate" />
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