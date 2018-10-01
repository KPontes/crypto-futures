pragma solidity 0.4.24;

//import "browser/StringUtils.sol" as strUtils;

//ETHK18  (0x4554484b3138) contract size (0.1 eth) in Wei  100000000000000000 , enDate 1535587200
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

    function testStuff (bytes32 v1) public pure returns (bytes32){
        //bytes32 v2 = keccak256(bytes(v1));
        return (v1);
   }

}

contract FutureContract {
    uint constant gasReserve = 900000000000000;

    struct BuyOrder {
        address buyer;
        bytes32 key;
        uint contractsAmount;
        uint depositedEther; //wei
        uint margin;
        uint dealPrice; //* 100
    }

    struct SellOrder {
        address seller;
        bytes32 key;
        uint contractsAmount;
        uint depositedEther; //wei
        uint margin;
        uint dealPrice; //* 100
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
        bool closed;
        bool settled;
    }

    address public owner;
    uint public endDate;
    uint public contractSize; //in wei
    bytes32 public title;
    string public contributeTest;

    mapping(address => uint) public balance;
    mapping(bytes32 => Trade) public tradesMap;
    mapping(bytes32 => BuyOrder)  public buyOrdersMap;
    mapping(bytes32 => SellOrder)  public sellOrdersMap;

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

    function contribute(string key) payable public {
        require(msg.value > 0);
        balance[msg.sender] += msg.value;
        contributeTest = key;
    }

    function createBuyOrder(
        bytes32 key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value >= contractsAmount * contractSize, "Insufficient deposit");
        require(msg.sender != owner, "Manager can not bid");
        require (now < endDate, "End date expired");

        uint fees = calculateFee(msg.value);

        BuyOrder memory newBuyOrder = BuyOrder({
            buyer: msg.sender,
            key: key,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: msg.value - fees
        });
        buyOrdersMap[key] = newBuyOrder;
        balance[owner] += fees;
    }


    function createSellOrder(
        bytes32 key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public {

        require(msg.value >= contractsAmount * contractSize, "Insufficient deposit");
        require(msg.sender != owner, "Manager can not bid");
        require (now < endDate, "End date expired");

        uint fees = calculateFee(msg.value);
        SellOrder memory newSellOrder = SellOrder({
            seller: msg.sender,
            key: key,
            dealPrice: dealPrice,
            contractsAmount: contractsAmount,
            margin: margin,
            depositedEther: msg.value - fees
        });
        sellOrdersMap[key] = newSellOrder;
        balance[owner] += fees;
    }


    function createTrade(bytes32 tradeKey, bytes32 buyOrderKey, bytes32 sellOrderKey) public returns (bool) {

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
            closed: false,
            settled: false
        });

        tradesMap[tradeKey] = newTrade;
        return true;
    }

     function tradeWithdraw(bytes32 tradeKey) public returns (bool) {

        Trade storage trade = tradesMap[tradeKey];
        BuyOrder memory buyOrder = buyOrdersMap[trade.buyOrderKey];
        SellOrder memory sellOrder = sellOrdersMap[trade.sellOrderKey];

        require(buyOrder.buyer == msg.sender || sellOrder.seller == msg.sender, "Invalid requester or no trade created");
        require(trade.settled, "Settlement calculations not done yet");
        require(!trade.closed, "Trade already closed");

        if (buyOrder.buyer == msg.sender && trade.buyerWithdraw == 0) {
            if (trade.buyerExitEtherAmount > 0) {
                msg.sender.transfer(trade.buyerWithdraw);
                trade.buyerWithdraw = trade.buyerExitEtherAmount;
                // No need to call throw here, just reset the amount owing
            }
        }

        if (sellOrder.seller == msg.sender && trade.sellerWithdraw == 0) {
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
        SellOrder memory so = sellOrdersMap[trade.sellOrderKey];

        require(so.contractsAmount > 0, "Invalid trade key");
        require(!trade.settled, "Settlement calculations already done");
        require(!trade.closed, "Trade already closed");
        require(endDate <= now, "Wait for expiration date");

        trade.exitPrice = exitPrice;
        trade.exitFactor = exitFactor;
        trade.sellerExitEtherAmount = so.depositedEther * 2 * exitFactor / 1000;
        trade.buyerExitEtherAmount = so.depositedEther * 2 - (so.depositedEther * 2 * exitFactor / 1000);
        trade.settled = true;

        return trade.settled;

    }

    function getStorageVars() public view returns(uint, uint, bytes32) {
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
