pragma solidity 0.4.24;

contract FutureContractFactory {
    address[] public deployedContracts;

    function createFutureContract(string _title, uint _contractSize, uint _endDate) public returns (address) {
        address newContract = new FutureContract(_title, _contractSize, _endDate, msg.sender);
        deployedContracts.push(newContract);
        return newContract;
    }

    function getContractsAmount() public view returns (uint) {
        return deployedContracts.length;
    }

    function getDeployedFutures() public view returns (address[]) {
        return deployedContracts;
    }

}

//import "browser/StringUtils.sol" as strUtils;

//ETHK18 contract size (0.1 eth) in Wei  100000000000000000
//buy & sell orders: "111",1,1,770
// Liquidation "111", 900, 855

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

    address public owner;
    uint contractSize; //in wei
    uint endDate; //in seconds from 01-01-1970
    string title;

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
    //'ETHM18', 1, 15000000, '0x5fEDb99AAe7F1880A7a97b0cbe070231a6678f07'
    constructor(string _title, uint _contractSize, uint _endDate, address manager) public {
        require(address(msg.sender).balance == 0, "Used address attack");
        owner = manager;
        contractSize = _contractSize;
        endDate = _endDate;
        title = _title;
    }

    function getKeyHash(string key) public pure returns (bytes32) {

        return keccak256(bytes(key));
    }

    function testStuff (uint deal, uint expiration) public pure returns (uint){
        uint factor = 1000;
        //return (factor * deal / expiration);
        return (factor + factor - (factor * deal / expiration));
   }

    function compareStrings (string str1, string str2) private pure returns (bool){
        bytes memory a = bytes(str1);
        bytes memory b = bytes(str2);
        return keccak256(a) == keccak256(b);
   }

    function createBuyOrder(
        string tradeKey,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public isValid returns (bytes32) {

        require(msg.value >  900000000000000 + contractsAmount * contractSize, "Insufficient deposit"); //Assure some gas amount
        require(msg.sender != owner, "Manager can not bid");
        require (now > endDate, "End date expired");

        bytes32 hashedKey = keccak256(bytes(tradeKey));

        BuyOrder memory newBuyOrder = BuyOrder({
            buyer: msg.sender,
            tradeKey: hashedKey,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: msg.value
        });
        buyOrdersMap[hashedKey] = newBuyOrder;
        return hashedKey;
    }

    function createSellOrder(
        string tradeKey,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public isValid returns (bytes32) {

        require(msg.value > 900000000000000 + contractsAmount * contractSize, "Insufficient deposit"); //Assure some gas amount
        require(msg.sender != owner, "Manager can not bid");
        require (now > endDate, "End date expired");

        bytes32 hashedKey = keccak256(bytes(tradeKey));

        SellOrder memory newSellOrder = SellOrder({
            seller: msg.sender,
            tradeKey: hashedKey,
            dealPrice: dealPrice,
            contractsAmount: contractsAmount,
            margin: margin,
            depositedEther: msg.value
        });
        sellOrdersMap[hashedKey] = newSellOrder;
        return hashedKey;

    }


    function createTrade(string key) public returns (bool) {

        bytes32 hashedKey = keccak256(bytes(key));
        require(buyOrdersMap[hashedKey].tradeKey == hashedKey, "Must have a buy order created");
        require(sellOrdersMap[hashedKey].tradeKey == hashedKey, "Must have a sell order created");
        require(sellOrdersMap[hashedKey].dealPrice <= buyOrdersMap[hashedKey].dealPrice, "DealPrice does not match");
        require(sellOrdersMap[hashedKey].seller != buyOrdersMap[hashedKey].buyer, "Buyer and seller must be different");
        require (now > endDate, "End date expired");

        Trade memory newTrade = Trade({key: hashedKey,
            seller: sellOrdersMap[hashedKey].seller,
            buyer: buyOrdersMap[hashedKey].buyer,
            contractsAmount: sellOrdersMap[hashedKey].contractsAmount + buyOrdersMap[hashedKey].contractsAmount,
            etherAmount: sellOrdersMap[hashedKey].depositedEther + buyOrdersMap[hashedKey].depositedEther,
            dealPrice: sellOrdersMap[hashedKey].dealPrice,
            exitPrice: 0,
            exitFactor: 0,
            sellerExitEtherAmount: 0,
            buyerExitEtherAmount: 0,
            sellerWithdraw: 0,
            buyerWithdraw: 0,
            closed: false,
            settled: false
        });

        tradesMap[hashedKey] = newTrade;
        return true;
    }

    function tradeWithdraw(string key, address requester) public returns (bool) {
        bytes32 hashedKey = keccak256(bytes(key));
        Trade storage trade = tradesMap[hashedKey];

        require(trade.buyer == requester || trade.seller == requester, "Invalid requester or no trade created");
        require(trade.settled, "Settlement calculations not done yet");
        require(!trade.closed, "Trade already closed");

        if (trade.buyer == requester && trade.buyerWithdraw == 0) {
            if (trade.buyerExitEtherAmount > 0) {
                trade.buyerWithdraw = trade.buyerExitEtherAmount;
                if (!requester.send(trade.buyerWithdraw)) {
                    // No need to call throw here, just reset the amount owing
                    trade.buyerWithdraw = 0;
                    return false;
                }
            }
        }
        if (trade.seller == requester && trade.sellerWithdraw == 0) {
            if (trade.sellerExitEtherAmount > 0) {
                trade.sellerWithdraw = trade.sellerExitEtherAmount;
                if (!requester.send(trade.sellerWithdraw)) {
                    // No need to call throw here, just reset the amount owing
                    trade.sellerWithdraw = 0;
                    return false;
                }
            }
        }
        if (trade.buyerWithdraw == trade.buyerExitEtherAmount &&
            trade.sellerWithdraw == trade.sellerExitEtherAmount) {
            trade.closed = true;
        }

        return true;

    }

    function calculateLiquidation(string key, uint exitPrice, uint exitFactor) public restricted returns (bool) {
        bytes32 hashedKey = keccak256(bytes(key));
        Trade storage trade = tradesMap[hashedKey];
        SellOrder storage sellOrder = sellOrdersMap[hashedKey];

        require(trade.contractsAmount > 0, "Invalid trade key");
        require(!trade.settled, "Settlement calculations already done");
        require(!trade.closed, "Trade already closed");
        require(endDate <= now, "Wait for expiration date");

        trade.exitPrice = exitPrice;
        trade.exitFactor = exitFactor;
        trade.sellerExitEtherAmount = sellOrder.contractsAmount * contractSize * exitFactor / 1000;
        trade.buyerExitEtherAmount = trade.contractsAmount * contractSize - (sellOrder.contractsAmount * contractSize * exitFactor / 1000);
        trade.settled = true;

        return true;

    }

    //Criar a função de calculo
    //Verificar que o withdraw atualizou o trade storage
    //verificar conversão de datas
    //Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada

}
