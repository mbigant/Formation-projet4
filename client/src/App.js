import React, {Component} from "react";
import StakingContract from "./contracts/Staking.json";
import getWeb3 from "./getWeb3";
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3Context from "./store/web3-context";

import "./App.css";
import Header from "./components/Header";
import StakingList from "./components/StakingList";
import {Container} from "react-bootstrap";
import {Route, Switch} from "react-router-dom";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import Intro from "./components/Intro";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, pools: 0 };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StakingContract.networks[networkId];

      const instance = new web3.eth.Contract(
        StakingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      let owner = await instance.methods.owner().call();

      if( window.ethereum ) {
        // detect Metamask account change
        window.ethereum.on('accountsChanged', (accounts) => {
            this.setState({accounts});
        });

        // detect Network account change
        window.ethereum.on('networkChanged', (newNetworkId) => {

            const network = StakingContract.networks[newNetworkId];

            if( network ) {
                const instance = new web3.eth.Contract(
                    StakingContract.abi,
                    network.address,
                );

                this.setState({contract: instance});
            }
            else {
                alert(`Unsuported network ! Please change`);
            }

        });
      }
      this.setState({ web3, accounts, contract: instance, owner: owner.toLowerCase()});
    } catch (error) {
//      alert(
//        `Failed to load web3, accounts, or contract. Check console for details.`,
//      );
      console.error('Failed to load web3, accounts, or contract')
      console.error(error);
    }
  };

  render() {
    const stakingList = () => {
        if (this.state.web3) {
            return <StakingList />;
        }
    }

    const adminPanel = () => {
        if (this.state.web3) {
            return <AdminPanel />;
        }
    }

    return (
      <Web3Context.Provider value={{web3: this.state.web3, contract: this.state.contract, accounts: this.state.accounts, owner: this.state.owner}} >
          <div className="App">
              <Header/>
              <Container className="main">
                  <Switch>
                      <Route exact path="/">
                          <Intro />
                          {stakingList()}
                      </Route>
                      <Route exact path="/admin">
                          {adminPanel()}
                      </Route>
                  </Switch>
              </Container>
              <Footer/>
          </div>
      </Web3Context.Provider>
      
    );
  }
}

export default App;
