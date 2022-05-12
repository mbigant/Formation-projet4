// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DegenToken is ERC20 {

    constructor(uint256 amount) ERC20("Degen Token", "DEGEN") {
        _mint(msg.sender, amount);
    }

}