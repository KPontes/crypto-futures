pragma solidity 0.4.24;

import "./FutureContract.sol";

contract FutureContractFactory {

    address[] public deployedContracts;

    function createFutureContract(string _title, uint _contractSize, uint _endDate, address _futureStorage) public returns (FutureContract) {
        FutureContract newContract = new FutureContract(_title, _contractSize, _endDate, msg.sender, _futureStorage);
        deployedContracts.push(newContract);
        return newContract;
    }

    function getContractsAmount() public view returns (uint) {
        return deployedContracts.length;
    }

}
