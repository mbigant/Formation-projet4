import React, {Component} from "react";
import {Badge, Container, Nav, Navbar} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import "../styles/header.css";

import etherWalletImg from '../images/ether-wallet.png'
import {handleConnect} from '../utils/metamask'

import ENSText from "./ENSText";


class Header extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {

    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    render() {

        const connectUser = () => {
            if (this.context.web3) {
                if ( this.context.accounts.length > 0 ) {
                    return <Navbar.Text>
                           <div>
                            <ENSText address={this.context.accounts[0]} />
                           </div>
                           </Navbar.Text>
                } else {
                    return <Navbar.Text> <Badge bg="danger">Not connected</Badge> </Navbar.Text>
                }
            } else {
                return <Nav.Link onClick={handleConnect}><img src={etherWalletImg} width="30" height="30"/> <b>Wallet Connect</b></Nav.Link>
            }
        }

        const adminLink = () => {
            if (this.context.web3) {
               const user = this.context.accounts[0].toLowerCase();
               const owner = this.context.owner;
               if (user === owner) {
                    return <Nav.Link href="#/admin">Admin Page</Nav.Link>;
               }
           }
        }

        return (
            <Navbar bg="light" expand="lg" fixed="top" className="header">
                <Container>
                    <Navbar.Brand href="#">Staking 0.1</Navbar.Brand>                                       
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {adminLink()}
                        <Navbar.Collapse className="justify-content-end">
                            {connectUser()}

                        </Navbar.Collapse>

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }

}

export default Header;