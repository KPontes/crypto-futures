pragma solidity 0.4.24;

//import "browser/StringUtils.sol" as strUtils;

//ETHK18  contract size (0.1 eth) in Wei  100000000000000000 , enDate 1535587200
//buy & sell orders: "111",1,1,770
// Liquidation "111", 900, 855

contract FutureContractFactory {
    address[] public deployedContracts;

    function createFutureContract(string _title, uint _contractSize, uint _endDate) public returns (FutureContract) {
        FutureContract newContract = new FutureContract(_title, _contractSize, _endDate, msg.sender);
        deployedContracts.push(newContract);
        return newContract;
    }

    function getContractsAmount() public view returns (uint) {
        return deployedContracts.length;
    }

}

contract FutureContract {
    uint constant gasReserve = 900000000000000;
    enum State { Created, Settled, Closed }

    struct BuyOrder {
        address buyer;
        bytes32 key;
        uint contractsAmount;
        uint depositedEther; //wei
        uint margin;
        uint dealPrice; //* 100
        uint fees; //wei
    }

    struct SellOrder {
        address seller;
        bytes32 key;
        uint contractsAmount;
        uint depositedEther; //wei
        uint margin;
        uint dealPrice; //* 100
        uint fees; //wei
    }

    struct Trade {
        bytes32 key;
        bytes32 buyOrderKey;
        bytes32 sellOrderKey;
        uint exitPrice; //* 100
        uint exitFactor; //* 1000
        uint sellerExitEtherAmount; //wei
        uint buyerExitEtherAmount; //wei
        uint sellerWithdraw; //wei
        uint buyerWithdraw; //wei
        State status;
    }

    address public owner;
    uint public endDate;
    uint public contractSize; //in wei
    string public title;

    mapping(address => uint) public balance;
    mapping(bytes32 => Trade) public tradesMap;
    mapping(bytes32 => SellOrder)  public sellOrdersMap;
    mapping(bytes32 => BuyOrder)  public buyOrdersMap;

    modifier restricted() {
        require(msg.sender == owner, "Only allowed to manager");
        _;
    }

    modifier isValid() {
        require(endDate <= now, "Wait for expiration date");
        _;
    }

    constructor(string _title, uint _contractSize, uint _endDate, address manager) public {
        //require(address(this).balance == 0, "Used address attack");
        owner = manager;
        contractSize = _contractSize;
        endDate = _endDate;
        title = _title;
    }

    function createBuyOrder(
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value >= contractsAmount * contractSize, "Insufficient deposit");
        require(msg.sender != owner, "Manager can not bid");
        require (now < endDate, "End date expired");

        bytes32 keyByte = keccak256(bytes(key));
        uint fees = calculateFee(msg.value);
        createBuyOrder(keyByte, contractsAmount, margin, dealPrice, msg.value, fees);
    }

    function createBuyOrder(
        bytes32 key,
        uint contractsAmount,
        uint margin,
        uint dealPrice,
        uint depositedEther,
        uint fees
        ) private {

        BuyOrder memory newBuyOrder = BuyOrder({
            buyer: msg.sender,
            key: key,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: depositedEther,
            fees: fees
        });
        buyOrdersMap[key] = newBuyOrder;
        balance[owner] += fees;
    }

    function getBuyOrder(string key) public view returns(address, uint, uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (buyOrdersMap[keyByte].buyer, buyOrdersMap[keyByte].contractsAmount, buyOrdersMap[keyByte].depositedEther, buyOrdersMap[keyByte].fees, buyOrdersMap[keyByte].dealPrice);

    }

    function createSellOrder(
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value >= contractsAmount * contractSize, "Insufficient deposit");
        require(msg.sender != owner, "Manager can not bid");
        require (now < endDate, "End date expired");

        bytes32 keyByte = keccak256(bytes(key));
        uint fees = calculateFee(msg.value);
        createSellOrder(keyByte, contractsAmount, margin, dealPrice, msg.value, fees);
    }

    function createSellOrder(
        bytes32 key,
        uint contractsAmount,
        uint margin,
        uint dealPrice,
        uint depositedEther,
        uint fees
        ) private {

        SellOrder memory newSellOrder = SellOrder({
            seller: msg.sender,
            key: key,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: depositedEther,
            fees: fees
        });
        sellOrdersMap[key] = newSellOrder;
        balance[owner] += fees;
    }

    function getSellOrder(string key) public view returns(address, uint, uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (sellOrdersMap[keyByte].seller, sellOrdersMap[keyByte].contractsAmount, sellOrdersMap[keyByte].depositedEther, sellOrdersMap[keyByte].fees, sellOrdersMap[keyByte].dealPrice);

    }

    function createTrade(string tradeKey, string buyOrderKey, string sellOrderKey) public  {
      bytes32 tradeByte = keccak256(bytes(tradeKey));
      bytes32 buyByte = keccak256(bytes(buyOrderKey));
      bytes32 sellByte = keccak256(bytes(sellOrderKey));
      createTrade(tradeByte, buyByte, sellByte);
    }

    function createTrade(bytes32 tradeKey, bytes32 buyOrderKey, bytes32 sellOrderKey) public {

        require(buyOrdersMap[buyOrderKey].depositedEther > 0, "Must have a buy order created");
        require(sellOrdersMap[sellOrderKey].depositedEther > 0, "Must have a sell order created");
        require(sellOrdersMap[sellOrderKey].dealPrice <= buyOrdersMap[buyOrderKey].dealPrice, "DealPrice does not match");
        require(sellOrdersMap[sellOrderKey].seller != buyOrdersMap[buyOrderKey].buyer, "Buyer and seller must be different");
        require (now <= endDate, "End date expired");

        Trade memory newTrade = Trade({
            key: tradeKey,
            buyOrderKey: buyOrderKey,
            sellOrderKey: sellOrderKey,
            exitPrice: 0,
            exitFactor: 0,
            sellerExitEtherAmount: 0,
            buyerExitEtherAmount: 0,
            sellerWithdraw: 0,
            buyerWithdraw: 0,
            status: State.Created
        });

        tradesMap[tradeKey] = newTrade;
    }

    function getTrade(string key) public view returns(uint, uint, uint, uint, uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (
          tradesMap[keyByte].exitPrice,
          tradesMap[keyByte].exitFactor,
          tradesMap[keyByte].sellerExitEtherAmount,
          tradesMap[keyByte].buyerExitEtherAmount,
          tradesMap[keyByte].sellerWithdraw,
          tradesMap[keyByte].buyerWithdraw,
          uint(tradesMap[keyByte].status));
    }

    function getStorageVars() public view returns(uint, uint, string) {
        return (endDate, contractSize, title);
    }

    function calculateFee(uint etherValue) private pure returns(uint) {
        return (etherValue/1000) + gasReserve;
    }



    //Criar a função de calculo
    //Verificar que o withdraw atualizou o trade storage
    //verificar conversão de datas
    //Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada

}
