import React, {Component} from "react";
import {Alert, Button} from "react-bootstrap";

class Intro extends Component {
    handleGithub = () => {
      console.log("github");
      window.open('https://github.com/mbigant/Formation-projet4')
    }

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
              <Button onClick={this.handleGithub} variant='secondary'>View on Github</Button>
            </Alert>
        );
    }
}

export default Intro;