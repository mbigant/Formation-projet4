import React, {Component} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import web3 from "web3";

class Withdraw extends Component {

    constructor(props) {
        super(props);

        this.state = {
            withdrawAmount: 0,
            isValidAmount: false,
            errorMessage: null
        };

        this.withdrawAmountInput = React.createRef();
    }

    withdrawAmountInputHandler = (e) => {
        this.handleInputValueChanged(e.target.value);
    }

    requestWithdraw = async (e) => {
        e.preventDefault();

        this.props.onWithdrawRequested(this.state.withdrawAmount);
    }

    useMaxWithdrawHandler = (e) => {
        const val = web3.utils.fromWei(this.props.userBalanceInPool);
        this.withdrawAmountInput.current.value = val;
        this.handleInputValueChanged(val);
    }

    handleInputValueChanged = (val) => {

        if( val > 0 ) {
            if( web3.utils.toBN(web3.utils.toWei(val.toString())).gt(web3.utils.toBN(this.props.userBalanceInPool) )) {
                this.setState({
                    withdrawAmount: web3.utils.toWei(val.toString()),
                    isValidAmount: false,
                    errorMessage: "Insufficient founds"
                })
            }
            else {
                this.setState({
                    withdrawAmount: web3.utils.toWei(val.toString()),
                    isValidAmount: true,
                    errorMessage: null
                })
            }
        }
        else {
            this.setState({
                withdrawAmount: 0,
                isValidAmount: false,
                errorMessage: null
            })
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    render() {

        return (
            <>
                <Form onSubmit={this.requestWithdraw.bind(this)}>
                    <Form.Group className="mb-3 text-end form-floating">
                        <InputGroup>
                            <Button onClick={this.useMaxWithdrawHandler.bind(this)} variant="outline-secondary">Max</Button>
                            <Form.Control ref={this.withdrawAmountInput} onChange={this.withdrawAmountInputHandler.bind(this)} type="number" min="O" placeholder="Withdraw amount" required />
                        </InputGroup>
                        { this.state.errorMessage &&
                            <Form.Text className="text-danger">
                                { this.state.errorMessage }
                            </Form.Text>
                        }
                    </Form.Group>

                    <div className="d-grid">
                        <Button variant="primary" type="submit" disabled={!this.state.isValidAmount}>
                            Withdraw
                        </Button>
                    </div>
                </Form>
            </>
        )
    }
}

export default Withdraw;