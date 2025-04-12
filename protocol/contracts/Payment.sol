// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.2 <0.9.0;

contract Payment {
    address public owner;
    mapping(address => uint256) public deposit;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    function increaseDeposit() external payable {
        require(msg.value > 0, "Must send ETH to deposit");
        deposit[msg.sender] += msg.value;
    }

    function ownerWithdrawFrom(address user, uint256 amount) external onlyOwner {
        require(deposit[user] >= amount, "Insufficient user deposit");
        deposit[user] -= amount;
        payable(owner).transfer(amount);
    }
}
