import React, {Component} from "react";
import {Badge, Container, Navbar} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import "../styles/header.css";

class Header extends Component {

    static contextType = Web3Context;
    displayAddress;

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {

    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    handleClick = () => {
        // try {
        //     navigator.clipboard.writeText(this.context.accounts[0]);
        //   } catch (error) {
        //     console.log(error);
        //   }
    }

    render() {

        return (
            <Navbar bg="light" expand="lg" fixed="top" className="header">
                <Container>
                    <Navbar.Brand href="#">Staking 0.1</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Navbar.Collapse className="justify-content-end">
                            <Navbar.Text>
                                { this.context.accounts.length > 0 ? 
                                    <div>
                                        {`${this.context.accounts[0].substring(0, 4)}...${this.context.accounts[0].substring(this.context.accounts[0].length - 4)}`}
                                        {/* <Button variant="outline-secondary" onClick={this.handleClick}>Copy</Button> */}
                                    </div> 
                                    : 
                                    <Badge bg="danger">Not connected</Badge> }
                            </Navbar.Text>
                        </Navbar.Collapse>

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }

}

export default Header;