pragma solidity 0.4.24;

//import "browser/StringUtils.sol" as strUtils;

//ETHK18 contract size (0.1 eth) in Wei  100000000000000000
//buy & sell orders: "111",1,1,770
// Liquidation "111", 900, 855

contract FutureContractFactory {
    address[] public deployedContracts;

    function createFutureContract(bytes32 _title, uint _contractSize, uint _endDate) public returns (address) {
        address newContract = new FutureContract(_title, _contractSize, _endDate, msg.sender);
        deployedContracts.push(newContract);
        return newContract;
    }

    function getContractsAmount() public view returns (uint) {
        return deployedContracts.length;
    }

}

contract FutureContract {

    struct BuyOrder {
        address buyer;
        bytes32 tradeKey;
        uint contractsAmount;
        uint depositedEther; //wei
        uint margin;
        uint dealPrice; //* 100
    }

    struct SellOrder {
        address seller;
        bytes32 tradeKey;
        uint contractsAmount;
        uint depositedEther; //wei
        uint margin;
        uint dealPrice; //* 100
    }

    struct OrderType {
        bytes32 tradeKey;
        uint buySell; //1: buy; 2: sell
    }

    struct Trade {
        bytes32 key;
        address seller;
        address buyer;
        uint contractsAmount;
        uint etherAmount; //wei
        uint dealPrice; //* 100
        uint exitPrice; //* 100
        uint exitFactor; //* 1000
        uint sellerExitEtherAmount; //wei
        uint buyerExitEtherAmount; //wei
        uint sellerWithdraw; //wei
        uint buyerWithdraw; //wei
        bool closed;
        bool settled;
    }

    address owner;
    uint public endDate;
    uint public contractSize; //in wei
    bytes32 public title;

    mapping(bytes32 => Trade) public tradesMap;
    mapping(bytes32 => BuyOrder)  public buyOrdersMap;
    mapping(bytes32 => SellOrder)  public sellOrdersMap;
    mapping(address => OrderType[])  public addressOrdersMap; //brings all trades of an address


    modifier restricted() {
        require(msg.sender == owner, "Only allowed to manager");
        _;
    }

    modifier isValid() {
        require(endDate <= now, "Wait for expiration date");
        _;
    }

    constructor(bytes32 _title, uint _contractSize, uint _endDate, address manager) public {
        require(address(msg.sender).balance == 0, "Used address attack");
        owner = manager;
        contractSize = _contractSize;
        endDate = _endDate;
        title = _title;
    }


    function contribute(bytes32 tradeKey) public payable {
        require(msg.value > 1000);
        OrderType memory orderType = OrderType({
            tradeKey: tradeKey,
            buySell: msg.value
        });
        addressOrdersMap[msg.sender].push(orderType);

    }

    function createBuyOrder(
        bytes32 tradeKey,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value >  900000000000000 + contractsAmount * contractSize, "Insufficient deposit"); //Assure some gas amount
        require(msg.sender != owner, "Manager can not bid");
        require (now < endDate, "End date expired");

        BuyOrder memory newBuyOrder = BuyOrder({
            buyer: msg.sender,
            tradeKey: tradeKey,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: msg.value
        });
        buyOrdersMap[tradeKey] = newBuyOrder;

        OrderType memory orderType = OrderType({
            tradeKey: tradeKey,
            buySell: 1
        });
        addressOrdersMap[msg.sender].push(orderType);
    }


    function createSellOrder(
        bytes32 tradeKey,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value > 900000000000000 + contractsAmount * contractSize, "Insufficient deposit"); //Assure some gas amount
        require(msg.sender != owner, "Manager can not bid");
        require (now < endDate, "End date expired");

        SellOrder memory newSellOrder = SellOrder({
            seller: msg.sender,
            tradeKey: tradeKey,
            dealPrice: dealPrice,
            contractsAmount: contractsAmount,
            margin: margin,
            depositedEther: msg.value
        });
        sellOrdersMap[tradeKey] = newSellOrder;

        OrderType memory orderType = OrderType({
            tradeKey: tradeKey,
            buySell: 2
        });
        addressOrdersMap[msg.sender].push(orderType);

    }


    function createTrade(bytes32 tradeKey) public returns (bool) {

        require(buyOrdersMap[tradeKey].tradeKey == tradeKey, "Must have a buy order created");
        require(sellOrdersMap[tradeKey].tradeKey == tradeKey, "Must have a sell order created");
        require(sellOrdersMap[tradeKey].dealPrice <= buyOrdersMap[tradeKey].dealPrice, "DealPrice does not match");
        require(sellOrdersMap[tradeKey].seller != buyOrdersMap[tradeKey].buyer, "Buyer and seller must be different");
        require (now > endDate, "End date expired");

        Trade memory newTrade = Trade({key: tradeKey,
            seller: sellOrdersMap[tradeKey].seller,
            buyer: buyOrdersMap[tradeKey].buyer,
            contractsAmount: sellOrdersMap[tradeKey].contractsAmount + buyOrdersMap[tradeKey].contractsAmount,
            etherAmount: sellOrdersMap[tradeKey].depositedEther + buyOrdersMap[tradeKey].depositedEther,
            dealPrice: sellOrdersMap[tradeKey].dealPrice,
            exitPrice: 0,
            exitFactor: 0,
            sellerExitEtherAmount: 0,
            buyerExitEtherAmount: 0,
            sellerWithdraw: 0,
            buyerWithdraw: 0,
            closed: false,
            settled: false
        });

        tradesMap[tradeKey] = newTrade;
        return true;
    }

     function tradeWithdraw(bytes32 tradeKey) public returns (bool) {

        Trade storage trade = tradesMap[tradeKey];

        require(trade.buyer == msg.sender || trade.seller == msg.sender, "Invalid requester or no trade created");
        require(trade.settled, "Settlement calculations not done yet");
        require(!trade.closed, "Trade already closed");

        if (trade.buyer == msg.sender && trade.buyerWithdraw == 0) {
            if (trade.buyerExitEtherAmount > 0) {
                msg.sender.transfer(trade.buyerWithdraw);
                trade.buyerWithdraw = trade.buyerExitEtherAmount;
                // No need to call throw here, just reset the amount owing
            }
        }

        if (trade.seller == msg.sender && trade.sellerWithdraw == 0) {
            if (trade.sellerExitEtherAmount > 0) {
                msg.sender.transfer(trade.sellerWithdraw);
                trade.sellerWithdraw = trade.sellerExitEtherAmount;
                // No need to call throw here, just reset the amount owing
            }
        }

        if (trade.buyerWithdraw == trade.buyerExitEtherAmount &&
            trade.sellerWithdraw == trade.sellerExitEtherAmount) {
            trade.closed = true;
        }
        return true;
    }

    function calculateLiquidation(bytes32 tradeKey, uint exitPrice, uint exitFactor) public restricted isValid returns (bool) {

        Trade storage trade = tradesMap[tradeKey];
        SellOrder storage sellOrder = sellOrdersMap[tradeKey];

        require(trade.contractsAmount > 0, "Invalid trade key");
        require(!trade.settled, "Settlement calculations already done");
        require(!trade.closed, "Trade already closed");
        require(endDate <= now, "Wait for expiration date");

        trade.exitPrice = exitPrice;
        trade.exitFactor = exitFactor;
        trade.sellerExitEtherAmount = sellOrder.contractsAmount * contractSize * exitFactor / 1000;
        trade.buyerExitEtherAmount = trade.contractsAmount * contractSize - (sellOrder.contractsAmount * contractSize * exitFactor / 1000);
        trade.settled = true;

        return trade.settled;

    }

    function getStorageVars() public view returns(uint, uint, bytes32) {
        return (endDate, contractSize, title);
    }

    function getOrdersLength(address requester) public view returns (uint) {
        return addressOrdersMap[requester].length;
    }

    function getOrder(address requester, uint index) public view returns(bytes32, uint) {
        return (addressOrdersMap[requester][index].tradeKey, addressOrdersMap[requester][index].buySell);
    }



    //Criar a função de calculo
    //Verificar que o withdraw atualizou o trade storage
    //verificar conversão de datas
    //Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada

}
