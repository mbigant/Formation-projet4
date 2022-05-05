// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {

    constructor(uint256 amount) ERC20("Reward Token", "RWT") {
        _mint(msg.sender, amount);
    }

}