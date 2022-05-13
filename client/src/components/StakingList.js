import React, {Component} from "react";
import Web3Context from "../store/web3-context";
import StakingItem from "./StakingItem";
import {Row} from "react-bootstrap";


class StakingList extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);

        this.state = {
            pools: []
        }
    }

    componentDidMount = () => {
        this.fetchPools();
    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    fetchPools = async () => {

        const pools = [];

        const events = await this.context.contract.getPastEvents('PoolCreated', {fromBlock: 0});

        for( let event of events ) {
            const poolId = event.returnValues.pool;
            const pool = await this.context.contract.methods.pools(poolId).call({from: this.context.accounts[0] })

            pools.push({
                ...pool,
                id: poolId
            });
        }

        this.setState({pools});
    }

    render() {

        return (
            <Row xs={1} xl={2} className="g-4">
                {
                    this.state.pools.map( (pool,index) => {
                        return <StakingItem key={index} pool={pool}></StakingItem>
                    })
                }
            </Row>
        );
    }

}

export default StakingList;