// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Pagos {
    address[] public payees;
    mapping(address => uint256) public shares;
    uint256 public totalShares;
    uint256 public nextDepositId;
    uint256 public nextReleaseId;

    event Deposit(uint256 indexed depositId, address indexed sender, uint256 amount);
    event Release(uint256 indexed releaseId, uint256 amount);

    constructor(address[] memory _payees, uint256[] memory _shares) {
        nextDepositId = 0;
        nextReleaseId = 0;
        require(_payees.length == _shares.length, "Length mismatch");
        require(_payees.length > 0, "No payees");

        for (uint256 i = 0; i < _payees.length; i++) {
            require(_payees[i] != address(0), "Invalid address");
            require(_shares[i] > 0, "Shares must be > 0");
            payees.push(_payees[i]);
            shares[_payees[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    function deposit() public payable {
        require(msg.value > 0, "Debe mandar ether");
        uint256 depositId = nextDepositId++;
        emit Deposit(depositId, msg.sender, msg.value);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function release() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay balance");
        uint256 releaseId = nextReleaseId++;

        for (uint256 i = 0; i < payees.length; i++) {
            address payable payee = payable(payees[i]);
            uint256 payment = (balance * shares[payee]) / totalShares;
            (bool success, ) = payee.call{value: payment}("");
            require(success, "Fallo el pago");
        }

        emit Release(releaseId, balance);
    }

    function getPayees() external view returns (address[] memory) {
        return payees;
    }

    function getShareOf(address _payee) external view returns (uint256) {
        return shares[_payee];
    }

    receive() external payable {
        deposit();
    }
}
