//Added CalcLiquidation and TradeWithdraw. Parou de funcionar

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
        uint sellerExitEtherAmount; //wei
        uint buyerExitEtherAmount; //wei
        State status;
    }

    struct ContractParams {
        address owner;
        uint endDate;
        uint contractSize; //in wei
        string title;
    }

    ContractParams public contractParams;
    mapping(address => uint) public balance;
    mapping(bytes32 => Trade) private tradesMap;
    mapping(bytes32 => SellOrder) private sellOrdersMap;
    mapping(bytes32 => BuyOrder) private buyOrdersMap;

    modifier restricted() {
        require(msg.sender == contractParams.owner, "Only allowed to manager");
        _;
    }

    modifier isValid() {
        require(contractParams.endDate <= now, "Wait for expiration date");
        _;
    }

    constructor(string _title, uint _contractSize, uint _endDate, address manager) public {
        //require(address(this).balance == 0, "Used address attack");
        contractParams.owner = manager;
        contractParams.contractSize = _contractSize;
        contractParams.endDate = _endDate;
        contractParams.title = _title;
    }

    function createBuyOrder(
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value >= contractsAmount * contractParams.contractSize, "Insufficient deposit");
        require(msg.sender != contractParams.owner, "Manager can not bid");
        require (now < contractParams.endDate, "End date expired");

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
        balance[contractParams.owner] += fees;
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

        require(msg.value >= contractsAmount * contractParams.contractSize, "Insufficient deposit");
        require(msg.sender != contractParams.owner, "Manager can not bid");
        require (now < contractParams.endDate, "End date expired");

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
        balance[contractParams.owner] += fees;
    }

    function getSellOrder(string key) public view returns(address, uint, uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (sellOrdersMap[keyByte].seller, sellOrdersMap[keyByte].contractsAmount, sellOrdersMap[keyByte].depositedEther, sellOrdersMap[keyByte].fees, sellOrdersMap[keyByte].dealPrice);

    }

    function createTrade(string tradeKey, string buyOrderKey, string sellOrderKey) restricted public  {
      bytes32 tradeByte = keccak256(bytes(tradeKey));
      bytes32 buyByte = keccak256(bytes(buyOrderKey));
      bytes32 sellByte = keccak256(bytes(sellOrderKey));
      createTrade(tradeByte, buyByte, sellByte);
    }

    function createTrade(bytes32 tradeKey, bytes32 buyOrderKey, bytes32 sellOrderKey) private {

        require(buyOrdersMap[buyOrderKey].depositedEther > 0, "Must have a buy order created");
        require(sellOrdersMap[sellOrderKey].depositedEther > 0, "Must have a sell order created");
        require(sellOrdersMap[sellOrderKey].dealPrice <= buyOrdersMap[buyOrderKey].dealPrice, "DealPrice does not match");
        require(sellOrdersMap[sellOrderKey].seller != buyOrdersMap[buyOrderKey].buyer, "Buyer and seller must be different");
        require (now <= contractParams.endDate, "End date expired");

        Trade memory newTrade = Trade({
            key: tradeKey,
            buyOrderKey: buyOrderKey,
            sellOrderKey: sellOrderKey,
            sellerExitEtherAmount: 1,
            buyerExitEtherAmount: 1,
            status: State.Created
        });

        tradesMap[tradeKey] = newTrade;
    }

    function getTrade(string key) public view returns(uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (
          tradesMap[keyByte].sellerExitEtherAmount,
          tradesMap[keyByte].buyerExitEtherAmount,
          uint(tradesMap[keyByte].status));
    }

    function tradeWithdraw(string tradeKey) public returns (bool) {
        bytes32 keyByte = keccak256(bytes(tradeKey));
        return tradeWithdraw(keyByte);
    }

    function tradeWithdraw(bytes32 tradeKey) private returns (bool) {

        Trade storage trade = tradesMap[tradeKey];
        BuyOrder memory buyOrder = buyOrdersMap[trade.buyOrderKey];
        SellOrder memory sellOrder = sellOrdersMap[trade.sellOrderKey];

        require(buyOrder.buyer == msg.sender || sellOrder.seller == msg.sender, "Invalid requester or no trade created");
        require(trade.status == State.Settled, "Settlement calculations not done yet");
        require(trade.status != State.Closed, "Trade already closed");

        if (buyOrder.buyer == msg.sender && trade.buyerExitEtherAmount > 1) {
             msg.sender.transfer(trade.buyerExitEtherAmount);
            trade.buyerExitEtherAmount = 0;
            // No need to call throw here, just reset the amount owing
        }

        if (sellOrder.seller == msg.sender && trade.sellerExitEtherAmount > 1) {
            msg.sender.transfer(trade.sellerExitEtherAmount);
            trade.sellerExitEtherAmount = 0;
            // No need to call throw here, just reset the amount owing
        }

        if (trade.buyerExitEtherAmount == 0 &&
            trade.sellerExitEtherAmount == 0) {
            trade.status = State.Closed;
        }
        return true;
    }

    // add modifier isValid after Testing
    function calculateLiquidation(string tradeKey, uint exitFactor) public restricted  returns (uint) {
        bytes32 keyByte = keccak256(bytes(tradeKey));
        return calculateLiquidation(keyByte, exitFactor);
    }
    /* uint exitPrice; //* 100
    uint exitFactor; //* 1000
    */
    function calculateLiquidation(bytes32 tradeKey, uint exitFactor) private returns (uint) {

        uint result = 0; //Fail
        Trade storage trade = tradesMap[tradeKey];
        SellOrder memory so = sellOrdersMap[trade.sellOrderKey];

        require(so.contractsAmount > 0, "Invalid trade key");
        require(trade.status != State.Settled, "Settlement calculations already done");
        require(trade.status != State.Closed, "Trade already closed");
        require(contractParams.endDate <= now, "Wait for expiration date");

        uint netValue = so.depositedEther - so.fees;
        trade.sellerExitEtherAmount = netValue * 2 * exitFactor / 1000;
        trade.buyerExitEtherAmount = netValue * 2 - (netValue * 2 * exitFactor / 1000);
        trade.status = State.Settled;
        result = 1;
        return result; //Success
    }

    function getStorageVars() public view returns(uint, uint, string) {
        return (contractParams.endDate, contractParams.contractSize, contractParams.title);
    }

    function calculateFee(uint etherValue) private pure returns(uint) {
        uint gasReserve = 900000000000000;
        return (etherValue/1000) + gasReserve;
    }

}
//Criar a função de calculo
//Verificar que o withdraw atualizou o trade storage
//verificar conversão de datas
//Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada
