import React, {Component} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import web3 from "web3";

class Deposit extends Component {

    constructor(props) {
        super(props);

        this.state = {
            depositAmount: 0,
            isValidAmount: false,
            errorMessage: null
        };

        this.depositAmountInput = React.createRef();
    }

    depositAmountInputHandler = (e) => {
        this.handleInputValueChanged(e.target.value);
    }

    requestDeposit = async (e) => {
        e.preventDefault();

        if( web3.utils.toBN(this.props.userAllowance).lt(web3.utils.toBN(this.state.depositAmount)) ) {
            // need approval before deposit
            this.props.onApproveRequested(this.state.depositAmount);
        }
        else {
            // go deposit
            this.props.onDepositeRequested(this.state.depositAmount);
        }
    }

    useMaxDepositHandler = (e) => {
        const val = web3.utils.fromWei(this.props.userBalanceInWallet);
        this.depositAmountInput.current.value = val;
        this.handleInputValueChanged(val);
    }

    handleInputValueChanged = (val) => {

        if( val > 0 ) {
            if( web3.utils.toBN(web3.utils.toWei(val.toString())).gt(web3.utils.toBN(this.props.userBalanceInWallet) )) {
                this.setState({
                    depositAmount: web3.utils.toWei(val.toString()),
                    isValidAmount: false,
                    errorMessage: "Insufficient founds"
                })
            }
            else {
                this.setState({depositAmount: web3.utils.toWei(val.toString()), isValidAmount: true, errorMessage: null})
            }
        }
        else {
            this.setState({depositAmount: 0, isValidAmount: false, errorMessage: null})
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    render() {

        const approveNeeded = web3.utils.toBN(this.props.userAllowance).lt(web3.utils.toBN(this.state.depositAmount));

        return (
            <>
                <Form onSubmit={this.requestDeposit.bind(this)}>
                    <Form.Group className="mb-3 text-end form-floating">
                        <InputGroup>
                            <Button onClick={this.useMaxDepositHandler.bind(this)} variant="outline-secondary">Max</Button>
                            <Form.Control ref={this.depositAmountInput} onChange={this.depositAmountInputHandler.bind(this)} type="number" min="O" placeholder="Deposit amount" required />
                        </InputGroup>
                        { this.state.errorMessage &&
                            <Form.Text className="text-danger">
                                { this.state.errorMessage }
                            </Form.Text>
                        }
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
            </>
        )
    }
}

export default Deposit;