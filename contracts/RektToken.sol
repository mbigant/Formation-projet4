// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RektToken is ERC20 {

    constructor(uint256 amount) ERC20("Rekt Token", "RKT") {
        _mint(msg.sender, amount);
    }

}