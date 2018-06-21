pragma solidity 0.4.24;

//import "browser/StringUtils.sol" as strUtils;

contract ETHK18 {

    struct BuyOrder {
        address buyer;
        bytes32 tradeKey;
        uint contractsAmount;
        uint depositedEther;
        uint dealPrice; //* 100
    }

    struct SellOrder {
        address seller;
        bytes32 tradeKey;
        uint contractsAmount;
        uint depositedEther;
        uint dealPrice; //* 100
    }

    struct Trade {
        bytes32 key;
        address seller;
        address buyer;
        uint contractsAmount;
        uint etherAmount;
        uint dealPrice; //* 100
        string exitPrice;
        uint sellerExitEtherAmount;
        uint buyerExitEtherAmount;
        uint sellerWithdraw;
        uint buyerWithdraw;
        bool closed;
        bool settled;
    }

    address public owner;
    uint contractSize;
    uint endDate;

    mapping(bytes32 => Trade) public tradesMap;
    mapping(bytes32 => BuyOrder)  public buyOrdersMap;
    mapping(bytes32 => SellOrder)  public sellOrdersMap;


    modifier restricted() {
        require(msg.sender == owner);
        _;
    }

    constructor(uint _contractSize, uint _endDate) public {
        require(address(msg.sender).balance > 0, "Used address attack");
        owner = msg.sender;
        contractSize = _contractSize;
        endDate = _endDate;
    }

    function getKeyHash(string key) public pure returns (bytes32) {

        return keccak256(bytes(key));
    }

    function compareStrings (string str1, string str2) private pure returns (bool){
        bytes memory a = bytes(str1);
        bytes memory b = bytes(str2);
        return keccak256(a) == keccak256(b);
   }

    function createBuyOrder(
        string tradeKey,
        uint contractsAmount,
        uint dealPrice
        ) payable public returns (bytes32) {

        require(msg.value >= contractsAmount * contractSize, "Insufficient deposit");
        require(msg.sender != owner, "Manager can not bid");
        require (now > endDate, "End date expired");

        bytes32 hashedKey = keccak256(bytes(tradeKey));

        BuyOrder memory newBuyOrder = BuyOrder({
            buyer: msg.sender,
            tradeKey: hashedKey,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            depositedEther: msg.value
        });
        buyOrdersMap[hashedKey] = newBuyOrder;
        return hashedKey;
    }

    function createSellOrder(
        string tradeKey,
        uint contractsAmount,
        uint dealPrice
        ) payable public returns (bytes32) {

        require(msg.value >= contractsAmount * contractSize, "Insufficient deposit");
        require(msg.sender != owner, "Manager can not bid");
        require (now > endDate, "End date expired");

        bytes32 hashedKey = keccak256(bytes(tradeKey));

        SellOrder memory newSellOrder = SellOrder({
            seller: msg.sender,
            tradeKey: hashedKey,
            dealPrice: dealPrice,
            contractsAmount: contractsAmount,
            depositedEther: msg.value
        });
        sellOrdersMap[hashedKey] = newSellOrder;
        return hashedKey;

    }

    function createTrade(string key) public returns (bool) {

        bytes32 hashedKey = keccak256(bytes(key));
        require(buyOrdersMap[hashedKey].tradeKey == hashedKey, "Must have a buy order created");
        require(sellOrdersMap[hashedKey].tradeKey == hashedKey, "Must have a sell order created");
        require(sellOrdersMap[hashedKey].dealPrice == buyOrdersMap[hashedKey].dealPrice, "DealPrice does not match");
        require(sellOrdersMap[hashedKey].seller != buyOrdersMap[hashedKey].buyer, "Buyer and seller must be different");
        require (now > endDate, "End date expired");

        Trade memory newTrade = Trade({key: hashedKey,
            seller: sellOrdersMap[hashedKey].seller,
            buyer: buyOrdersMap[hashedKey].buyer,
            contractsAmount: sellOrdersMap[hashedKey].contractsAmount + buyOrdersMap[hashedKey].contractsAmount,
            etherAmount: sellOrdersMap[hashedKey].depositedEther + buyOrdersMap[hashedKey].depositedEther,
            dealPrice: sellOrdersMap[hashedKey].dealPrice,
            exitPrice: '0',
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
        return true;

    }

    //Criar a função de calculo
    //Verificar que o withdraw atualizou o trade storage
    //verificar conversão de datas
    //Criar um buyerWithdraw e sellerWithdraw com assert de que não haja trade criada

}
