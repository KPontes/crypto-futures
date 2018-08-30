pragma solidity 0.4.24;

import "./IFutureStorage.sol";

contract FutureStorage is IFutureStorage {

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
        uint exitPrice; //*100
        State status;
    }

    mapping(bytes32 => BuyOrder) private buyOrdersMap;
    mapping(bytes32 => SellOrder) private sellOrdersMap;
    mapping(bytes32 => Trade) private tradesMap;

    function createOrder(
      address sender,
      uint8 orderType,
      bytes32 keyByte,
      uint contractsAmount,
      uint margin,
      uint dealPrice,
      uint depositedEther,
      uint fees
      ) public {
        if (orderType == 1) {
          createBuyOrder(sender, keyByte, contractsAmount, margin, dealPrice, depositedEther, fees);
        } else {
          createSellOrder(sender, keyByte, contractsAmount, margin, dealPrice, depositedEther, fees);
        }
      }

    function getOrder(uint8 orderType, string key) public view returns(address, uint, uint, uint, uint) {
      bytes32 keyByte = keccak256(bytes(key));
      if (orderType == 1) {
        return getBuyOrder(keyByte);
      } else {
        return getSellOrder(keyByte);
      }
    }

    function createBuyOrder(
        address buyer,
        bytes32 key,
        uint contractsAmount,
        uint margin,
        uint dealPrice,
        uint depositedEther,
        uint fees
        ) private {

        BuyOrder memory newBuyOrder = BuyOrder({
            buyer: buyer,
            key: key,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: depositedEther,
            fees: fees
        });
        buyOrdersMap[key] = newBuyOrder;
    }

    function getBuyOrder(bytes32 keyByte) private view returns(address, uint, uint, uint, uint) {
        //bytes32 keyByte = keccak256(bytes(key));
        return (buyOrdersMap[keyByte].buyer, buyOrdersMap[keyByte].contractsAmount,
            buyOrdersMap[keyByte].depositedEther, buyOrdersMap[keyByte].fees,
            buyOrdersMap[keyByte].dealPrice);
    }

    function createSellOrder(
        address seller,
        bytes32 key,
        uint contractsAmount,
        uint margin,
        uint dealPrice,
        uint depositedEther,
        uint fees
        ) private {

        SellOrder memory newSellOrder = SellOrder({
            seller: seller,
            key: key,
            contractsAmount: contractsAmount,
            dealPrice: dealPrice,
            margin: margin,
            depositedEther: depositedEther,
            fees: fees
        });
        sellOrdersMap[key] = newSellOrder;
    }

    function getSellOrder(bytes32 keyByte) private view returns(address, uint, uint, uint, uint) {
        //bytes32 keyByte = keccak256(bytes(key));
        return (sellOrdersMap[keyByte].seller, sellOrdersMap[keyByte].contractsAmount, sellOrdersMap[keyByte].depositedEther, sellOrdersMap[keyByte].fees, sellOrdersMap[keyByte].dealPrice);
    }

    function createTrade(bytes32 tradeKey, bytes32 buyOrderKey, bytes32 sellOrderKey) public {

        require(buyOrdersMap[buyOrderKey].depositedEther > 0, "Must have a buy order created");
        require(sellOrdersMap[sellOrderKey].depositedEther > 0, "Must have a sell order created");
        require(sellOrdersMap[sellOrderKey].dealPrice <= buyOrdersMap[buyOrderKey].dealPrice, "DealPrice does not match");
        require(sellOrdersMap[sellOrderKey].seller != buyOrdersMap[buyOrderKey].buyer, "Buyer and seller must be different");

        Trade memory newTrade = Trade({
            key: tradeKey,
            buyOrderKey: buyOrderKey,
            sellOrderKey: sellOrderKey,
            sellerExitEtherAmount: 1,
            buyerExitEtherAmount: 1,
            exitPrice: 0,
            status: State.Created
        });

        tradesMap[tradeKey] = newTrade;
    }

    function getTrade(string key) public view returns(uint, uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (
          tradesMap[keyByte].buyerExitEtherAmount,
          tradesMap[keyByte].sellerExitEtherAmount,
          tradesMap[keyByte].exitPrice,
          uint(tradesMap[keyByte].status));
    }

   function calculateLiquidation(bytes32 tradeKey, uint exitFactor, uint exitPrice) public {

        Trade storage trade = tradesMap[tradeKey];
        SellOrder memory so = sellOrdersMap[trade.sellOrderKey];

        // require(trade.status != State.Settled, "Settlement calculations already done");
        require(trade.status != State.Closed, "Trade already closed");
        require(so.contractsAmount > 0, "Invalid trade key");

        //considering exitFactor is * 1000000) ex. 855555
        trade.sellerExitEtherAmount = (so.depositedEther * exitFactor / 1000000) - so.fees;
        trade.buyerExitEtherAmount = (so.depositedEther * (2000000 - exitFactor) / 1000000) - so.fees;
        trade.exitPrice = exitPrice;
        trade.status = State.Settled;
    }

    function tradeWithdraw(bytes32 tradeKey, address sender) public view returns (bool, uint) {

        Trade memory trade = tradesMap[tradeKey];
        BuyOrder memory buyOrder = buyOrdersMap[trade.buyOrderKey];
        SellOrder memory sellOrder = sellOrdersMap[trade.sellOrderKey];
        bool isBuyer = true;
        uint exitEtherAmount = trade.buyerExitEtherAmount;
        if (sender == sellOrder.seller) {
            isBuyer = false;
            exitEtherAmount = trade.sellerExitEtherAmount;
        }

        require(buyOrder.buyer == sender || sellOrder.seller == sender, "Invalid requester or no trade created");
        require(trade.status != State.Closed, "Trade already closed");
        require(trade.status == State.Settled, "Settlement calculations not done yet");

        return (isBuyer, exitEtherAmount);
    }

    function setTradeWithdraw(bytes32 tradeKey, bool isBuyer, uint exitEtherAmount) public {
        Trade storage trade = tradesMap[tradeKey];

        if (isBuyer) {
            trade.buyerExitEtherAmount = exitEtherAmount;
        } else {
            trade.sellerExitEtherAmount = exitEtherAmount;
        }

        if (trade.buyerExitEtherAmount == 0 &&
        trade.sellerExitEtherAmount == 0) {
            trade.status = State.Closed;
        }
    }

}
