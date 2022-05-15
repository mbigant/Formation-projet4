import React, {Component, Fragment} from "react";
import Web3 from "web3";
import ENS, {getEnsAddress} from "@ensdomains/ensjs";
import {Badge, OverlayTrigger, Tooltip} from "react-bootstrap";
import * as Utils from "../utils";

class ENSText extends Component {

    constructor(props) {

        super(props);

        this.state = {
            address: null,
            addressPreview: null,
            ens: null
        };

        const provider = new Web3.providers.HttpProvider(
            "https://ropsten.infura.io/v3/d582c7d40d2148f590e23b2d7a812e20"
        );

        this.ens = new ENS({ provider, ensAddress: getEnsAddress('1') });
    }

    getEns( address ) {

        const addrPreview = this.props.address.slice(0,6) + '...' + this.props.address.slice(-4);

        this.ens.getName(address).then( resp => {
            if( resp.name ) {
                this.setState({ens: resp.name, addressPreview: addrPreview});
            }
            else {
                this.setState({ens: null, addressPreview: addrPreview});
            }
        });
    }

    componentDidMount = () => {
        this.getEns(this.props.address);
    }

    componentDidUpdate(prevProps, prevState) {
        if( prevProps.address !== this.props.address ) {
            this.getEns( this.props.address );
        }
    }

    render() {

        return (
            <Fragment>
                <OverlayTrigger
                    key={'address'}
                    placement={'bottom'}
                    overlay={
                        <Tooltip id="tooltip-address">
                            <span className={'font-monospace'}>{this.props.address}</span>
                        </Tooltip>
                    }
                >
                    <Badge bg="primary">
                    {
                        this.state.ens ? Utils.toTitle(this.state.ens) :  <span className={'font-monospace'}>{this.state.addressPreview}</span>
                    }
                    </Badge>

                </OverlayTrigger>
            </Fragment>
        )
    }
}

export default ENSText;