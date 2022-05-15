import React, {Component} from "react";
import {Alert} from "react-bootstrap";

class Intro extends Component {
    render() {

        return (
            <Alert variant="secondary">
              <Alert.Heading>Welcome to Alyra dApp staking</Alert.Heading>
              <p>
                Stake your DEGEN tokens and receive our RWT tokens
              </p>
              <p>
              <b>Disclaimer: This app is for testing purposes only and does not intend to use real money</b>
              </p>
              <p>You can have a good overview of the staking process before jumping into the real thing</p>
              <hr />
              <Alert.Link href="https://github.com/mbigant/Formation-projet4">View on Github</Alert.Link>

            </Alert>
        );
    }
}

export default Intro;