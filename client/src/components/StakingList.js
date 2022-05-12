import React, {Component} from "react";
import {Badge, Container, Navbar, Button, Card} from "react-bootstrap";
import Web3Context from "../store/web3-context";
import { poolList } from '../datas/pools'
import StakingItem from "./StakingItem";


class StakingList extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {

    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    render() {

        return (
            <div>
                <ul>
                    {/* { poolList.map((index)  => {
                            <div>
                                <StakingItem index={index}/>
                            </div>
                        })
                    } */}
                </ul>
            </div>
        );
    }

}

export default StakingList;