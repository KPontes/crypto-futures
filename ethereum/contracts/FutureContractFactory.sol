pragma solidity 0.4.24;

import "./FutureContract.sol";
//"ETHK18", "1000000000000000000", "1835587200",  "0x692a70d2e424a56d2c6c27aa97d1a86395877b3a"

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
