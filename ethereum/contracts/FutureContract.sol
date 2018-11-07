pragma solidity 0.4.24;

import "./IFutureStorage.sol";

//import "browser/IFutureContract.sol";
//"ETHK18", "1000000000000000000", "1835587200",  "0xbbf289d846208c16edc8474705c748aff07732db"

contract FutureContract  {

    IFutureStorage  FS;

    struct ContractParams {
        string title;
        address owner;
        uint contractSize; //in wei
        uint endDate;
        uint lastPrice; // *100
        bool allowWithdraw;
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
        contractParams.title = _title;
        contractParams.contractSize = _contractSize;
        contractParams.endDate = _endDate;
        contractParams.lastPrice = 0;
        contractParams.allowWithdraw = false;
        FS = IFutureStorage(_FS);
    }

    function setLiquidationPrice(uint _price, bool _allowWithdraw) restricted public {
        contractParams.lastPrice = _price;
        contractParams.allowWithdraw = _allowWithdraw;
    }

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

    function getTrade(string key) public view returns(uint, uint, uint, uint, uint, uint, uint) {
        return FS.getTrade(key);
    }

    function processLiquidation(string tradeKey, string buyOrderKey, string sellOrderKey, uint currPrice) public {
        //uncomment for PRD
        //require(contractParams.endDate <= now, "Wait for expiration date");
        // continue only if tradeKey in LiquidatedTradeMapping
        // or contractParams.allowWithdraw
        if (contractParams.lastPrice > 0) {
            currPrice = contractParams.lastPrice;
        }
        bytes32 tradeByte = keccak256(bytes(tradeKey));
        bytes32 buyByte = keccak256(bytes(buyOrderKey));
        bytes32 sellByte = keccak256(bytes(sellOrderKey));
        FS.processLiquidation(tradeByte, buyByte, sellByte, currPrice);
        tradeWithdraw(tradeByte, msg.sender);
    }

    function tradeWithdraw(bytes32 tradeByte, address caller) private {
        bool isBuyer;
        uint exitEtherAmount;
        (isBuyer, exitEtherAmount) = FS.tradeWithdraw(tradeByte, caller);
        //there is still wei to withdraw
        if (exitEtherAmount > 1) {
            FS.setTradeWithdrawValues(tradeByte, isBuyer, 0);
            if(!caller.send(exitEtherAmount)) {
                //on failure, return allowance for future withdraw
                FS.setTradeWithdrawValues(tradeByte, isBuyer, exitEtherAmount);
            }
        }

    }

    function getStorageVars() public view returns(uint, uint, uint, string, address) {
        return (contractParams.endDate, contractParams.lastPrice, contractParams.contractSize, contractParams.title, contractParams.owner);
    }

    function calculateFee(uint etherValue) private pure returns(uint) {
        return (etherValue/1000);
    }

    //Criar a função de calculo
    //Verificar que o withdraw atualizou o trade storage
    //verificar conversão de datas
    //Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada

}
