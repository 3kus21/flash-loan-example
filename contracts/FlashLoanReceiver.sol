// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../node_modules/hardhat/console.sol";
import "./FlashLoan.sol";
import "./Token.sol";

contract FlashLoanReceiver {
    FlashLoan private pool;
    address private owner;

    event LoanReceived(address token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this method");
        _;
    }

    modifier onlyPool() {
        require(msg.sender == address(pool), "Sender must be the pool");
        _;
    }

    constructor(address _poolAddress) {
        pool = FlashLoan(_poolAddress);
        owner = msg.sender;
    }

    function receiveTokens(address _tokenAddress, uint256 _amount) external onlyPool {
        require(Token(_tokenAddress).balanceOf(address(this)) == _amount, " Failed to get loan");
        emit LoanReceived(_tokenAddress, _amount);
        require(Token(_tokenAddress).transfer(msg.sender, _amount), "Return transfer of tokens failed");
    }

    function executeFlashLoan(uint _amount) external onlyOwner {
        pool.flashLoan(_amount);
    }
}