import React from "react";

const Web3Context = React.createContext({
    web3: null,
    contract: null,
    accounts: [],
    owner: null,
    pools: []
});

export default Web3Context;