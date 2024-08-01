// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommentPayment {
    address public owner;
    address public authorizedChanger;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public premiumComments;

    constructor(address _authorizedChanger) {
        owner = msg.sender;
        authorizedChanger = _authorizedChanger;
    }

    function payForComments() public payable {
        require(msg.value >= 20 ether, "Minimum 20 dollars required");
        balances[msg.sender] += msg.value;
        premiumComments[msg.sender] += 5;
    }

    function powerUpComment() public payable {
        require(msg.value >= 0.1 ether, "Minimum 0.1 dollars required");
        balances[msg.sender] += msg.value;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    function claimReward(address winner) public {
        require(msg.sender == authorizedChanger, "Only authorized address can claim reward");
        payable(winner).transfer(address(this).balance);
    }

    function changeAuthorizedChanger(address newChanger) public {
        require(msg.sender == owner, "Only owner can change the authorized address");
        authorizedChanger = newChanger;
    }
}
