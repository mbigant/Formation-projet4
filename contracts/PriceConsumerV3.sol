// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal immutable priceFeed;

    /**
     * https://docs.chain.link/docs/ethereum-addresses/
     *
     * Exemple :
     * Kovan ETH/USD 0x9326BFA02ADD2366b30bacB125260Af641031331
     * Kovan DAI/USD 0x777A68032a88E5A84678A77Af2CD65A7b3c0775a
     * Kovan USDC/USD 0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60
     * Kovan XAU/USD 0xc8fb5684f2707C82f28595dEaC017Bfdf44EE9c5
     */
    constructor(address _datafeed) {
        priceFeed = AggregatorV3Interface(_datafeed);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
        /*uint80 roundID*/,
        int price,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

        return price;
    }
}
