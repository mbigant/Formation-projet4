import React, {Component} from "react";
import {Container, Nav, Navbar} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import '../styles/footer.css';

class Footer extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);
        this.state = {blockNumber: ''};
    }

    componentDidMount = async () => {

        await this.getBlock();

        this.blockTimer = setInterval(
            () => this.getBlock(),
            2000
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    componentWillUnmount() {
        clearInterval(this.blockTimer);
    }

    async getBlock() {

        if( this.context.web3 ) {

            const bn = await this.context.web3.eth.getBlockNumber();
            this.setState({
                blockNumber: bn
            });
        }
    }

    render() {
        const contractAddress = () => {
            if( this.context.web3 ) {
                return this.context.contract._address ? <Nav>Contract&nbsp;<span className="font-monospace">{this.context.contract._address}</span></Nav> : ''
            }
        }
        return (
            <Navbar expand="lg" fixed="bottom" className="bg-light">
                <Container>
                    {contractAddress()}
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            Block {this.state.blockNumber}
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }

}

export default Footer;