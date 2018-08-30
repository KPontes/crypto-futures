pragma solidity 0.4.24;

import "./IFutureStorage.sol";

//"ETHK18", "100000000000000000", "1535587200",  "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "0x692a70d2e424a56d2c6c27aa97d1a86395877b3a"
contract FutureContract  {

    IFutureStorage  FS;

    struct ContractParams {
        address owner;
        uint endDate;
        uint contractSize; //in wei
        string title;
    }

    ContractParams public contractParams;
    mapping(address => uint) public balance;

    modifier restricted() {
        require(msg.sender == contractParams.owner, "Only allowed to manager");
        _;
    }

    // modifier isValid() {
    //     require(contractParams.endDate <= now, "Wait for expiration date");
    //     _;
    // }

    constructor(string _title, uint _contractSize, uint _endDate, address manager, address _FS) public {
        //require(address(this).balance == 0, "Used address attack");
        contractParams.owner = manager;
        contractParams.contractSize = _contractSize;
        contractParams.endDate = _endDate;
        contractParams.title = _title;
        FS = IFutureStorage(_FS);
    }

    /* function createBuyOrder(
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        validateOrder(msg.sender, msg.value, contractsAmount);

        // require(msg.value >= contractsAmount * contractParams.contractSize, "Insufficient deposit");
        // require(msg.sender != contractParams.owner, "Manager can not bid");
        // require (now < contractParams.endDate, "End date expired");

        bytes32 keyByte = keccak256(bytes(key));
        uint fees = calculateFee(msg.value);
        FS.createBuyOrder(msg.sender, keyByte, contractsAmount, margin, dealPrice, msg.value, fees);
        balance[contractParams.owner] += fees;
    } */

    /* function getBuyOrder(string key) public view returns(address, uint, uint, uint, uint) {
        return FS.getBuyOrder(key);
    } */

    function createOrder(
        uint8 orderType,
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        validateOrder(msg.sender, msg.value, contractsAmount);

        bytes32 keyByte = keccak256(bytes(key));
        uint fees = calculateFee(msg.value);
        FS.createOrder(msg.sender, orderType, keyByte, contractsAmount, margin, dealPrice, msg.value, fees);

        balance[contractParams.owner] += fees;
    }

    function getOrder(uint8 orderType, string key) public view returns(address, uint, uint, uint, uint) {
        return FS.getOrder(orderType, key);
    }

    function validateOrder(address sender, uint value, uint contractsAmount) private view {
        if ((value < contractsAmount * contractParams.contractSize) ||
            (sender == contractParams.owner) ||
            (now > contractParams.endDate)) {
            revert(); //invalid order
        }
    }

    function createTrade(string tradeKey, string buyOrderKey, string sellOrderKey) restricted public  {

      //require (now <= contractParams.endDate, "End date expired");
      if (now > contractParams.endDate) {
            revert(); //End date expired
        }

      bytes32 tradeByte = keccak256(bytes(tradeKey));
      bytes32 buyByte = keccak256(bytes(buyOrderKey));
      bytes32 sellByte = keccak256(bytes(sellOrderKey));
      FS.createTrade(tradeByte, buyByte, sellByte);
    }

    function getTrade(string key) public view returns(uint, uint, uint, uint) {
        return FS.getTrade(key);
    }

    function calculateLiquidation(string tradeKey, uint exitFactor, uint exitPrice) public restricted  {
        //uncomment for PRD
        //require(contractParams.endDate <= now, "Wait for expiration date");
        bytes32 keyByte = keccak256(bytes(tradeKey));
        FS.calculateLiquidation(keyByte, exitFactor, exitPrice);
    }

    function tradeWithdraw(string tradeKey) public {
        bytes32 keyByte = keccak256(bytes(tradeKey));
        bool isBuyer;
        uint exitEtherAmount;
        (isBuyer, exitEtherAmount) = FS.tradeWithdraw(keyByte, msg.sender);
        //there is still wei to withdraw
        if (exitEtherAmount > 1) {
            FS.setTradeWithdraw(keyByte, isBuyer, 0);
            if(!msg.sender.send(exitEtherAmount)) {
                //on failure, return allowance to future withdraw
                FS.setTradeWithdraw(keyByte, isBuyer, exitEtherAmount);
            }
        }

    }

    function getStorageVars() public view returns(uint, uint, string, address) {
        return (contractParams.endDate, contractParams.contractSize, contractParams.title, contractParams.owner);
    }

    function calculateFee(uint etherValue) private pure returns(uint) {
        return (etherValue/1000);
    }

    //Criar a função de calculo
    //Verificar que o withdraw atualizou o trade storage
    //verificar conversão de datas
    //Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada

}
