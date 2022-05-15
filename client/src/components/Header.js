import React, {Component} from "react";
import {Badge, Container, Nav, Navbar} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import "../styles/header.css";
import ENSText from "./ENSText";

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
        
        let adminLink;
        const user = this.context.accounts[0].toLowerCase();
        const owner = this.context.owner;
        if (user === owner) {
            adminLink = <Nav.Link href="#/admin">Admin Page</Nav.Link>                
        }
        return (
            <Navbar bg="light" expand="lg" fixed="top" className="header">
                <Container>
                    <Navbar.Brand href="#">Staking 0.1</Navbar.Brand>                                       
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {adminLink}
                        <Navbar.Collapse className="justify-content-end">
                            <Navbar.Text>
                                { this.context.accounts.length > 0 ? 
                                    <div>
                                        { this.context.accounts.length > 0 ? <ENSText address={this.context.accounts[0]} /> : <Badge bg="danger">Not connected</Badge> }
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