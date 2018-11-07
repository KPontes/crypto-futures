pragma solidity 0.4.24;

import "./IFutureStorage.sol";

contract FutureStorage is IFutureStorage {
    event Print(string _name, uint _value);
    event Print(string _name, bytes32 _value);

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
        uint sellerWithdraw; //wei
        uint buyerWithdraw; //wei
        uint exitPrice; //*100
        uint exitFactor; //*1000000
        State status;
    }

    mapping(bytes32 => BuyOrder) private buyOrdersMap;
    mapping(bytes32 => SellOrder) private sellOrdersMap;
    mapping(bytes32 => Trade) private tradesMap;
    //
    // mapping(bytes32 => uint) private logUint;
    // mapping(bytes32 => bytes32) private logByte;

    // function devLog(string key, uint _value) public {
    //     bytes32 keyByte = keccak256(bytes(key));
    //     logUint[keyByte] = _value;
    // }

    // function devLog(string key, bytes32 _value) public {
    //     bytes32 keyByte = keccak256(bytes(key));
    //     logByte[keyByte] = _value;
    // }

    // function getLog(string key, uint _type) public view returns(uint, bytes32) {
    //     bytes32 keyByte = keccak256(bytes(key));
    //     if (_type == 1) {
    //         return (logUint[keyByte], 0x123);
    //     } else {
    //         return (123, logByte[keyByte]);
    //     }
    // }

    // function playground(uint a, uint b) public pure returns(uint) {
    //     return 1000000 * a / b;
    // }

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

    function createTrade(bytes32 tradeKey, bytes32 buyOrderKey, bytes32 sellOrderKey) private {

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
            sellerWithdraw: 0,
            buyerWithdraw: 0,
            exitPrice: 0,
            exitFactor: 0,
            status: State.Created
        });

        tradesMap[tradeKey] = newTrade;
    }

    function getTrade(string key) public view returns(uint, uint, uint, uint, uint, uint, uint) {
        bytes32 keyByte = keccak256(bytes(key));
        return (
          tradesMap[keyByte].buyerWithdraw,
          tradesMap[keyByte].sellerWithdraw,
          tradesMap[keyByte].buyerExitEtherAmount,
          tradesMap[keyByte].sellerExitEtherAmount,
          tradesMap[keyByte].exitPrice,
          tradesMap[keyByte].exitFactor,
          uint(tradesMap[keyByte].status));
    }

   function processLiquidation(bytes32 tradeByte, bytes32 buyByte, bytes32 sellByte, uint exitPrice) public {
        //trade must be created and performed calculations only ONCE
        if (tradesMap[tradeByte].sellOrderKey != sellByte) {
            //devLog("sellByte", sellByte);
            createTrade(tradeByte, buyByte, sellByte);
            Trade storage trade = tradesMap[tradeByte];
            SellOrder memory so = sellOrdersMap[sellByte];
            BuyOrder memory bo = buyOrdersMap[buyByte];
            require(so.contractsAmount > 0 && bo.contractsAmount > 0  , "Invalid trade key");
            uint diffPrice;
            uint totalValue;
            uint totalDiff;
            uint diffDivLastPrice;
            if (exitPrice > so.dealPrice) {
                diffPrice  = exitPrice- so.dealPrice;
                totalValue = bo.margin * bo.depositedEther;
                totalDiff = diffPrice * totalValue;
                diffDivLastPrice = 1000000 * (totalDiff / exitPrice);
                trade.buyerExitEtherAmount = diffDivLastPrice / 1000000 + bo.depositedEther - bo.fees;
                trade.sellerExitEtherAmount = bo.depositedEther + so.depositedEther - trade.buyerExitEtherAmount - so.fees - bo.fees;
            } else {
                diffPrice  = so.dealPrice - exitPrice;
                totalValue = so.margin * so.depositedEther;
                diffPrice = so.dealPrice - exitPrice;
                totalDiff = diffPrice * totalValue;
                diffDivLastPrice = 1000000 * (totalDiff / exitPrice);
                trade.sellerExitEtherAmount = diffDivLastPrice / 1000000 + so.depositedEther - so.fees;
                trade.buyerExitEtherAmount = bo.depositedEther + so.depositedEther - trade.sellerExitEtherAmount - so.fees - bo.fees;
            }
            if (trade.buyerExitEtherAmount + trade.sellerExitEtherAmount > bo.depositedEther + so.depositedEther) {
                //treat calc error situation
                trade.buyerExitEtherAmount = bo.depositedEther - bo.fees;
                trade.sellerExitEtherAmount = so.depositedEther - so.fees;
            }
            trade.exitFactor = 1000000 * trade.sellerExitEtherAmount / (bo.depositedEther + so.depositedEther);
            trade.buyerWithdraw = trade.buyerExitEtherAmount;
            trade.sellerWithdraw = trade.sellerExitEtherAmount;
            trade.exitPrice = exitPrice;
        }
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
        if (exitEtherAmount == 0) {
            revert(); //optional test, avoid trying to send zero ether to requester
        }

        return (isBuyer, exitEtherAmount);
    }

    function setTradeWithdrawValues(bytes32 tradeKey, bool isBuyer, uint exitEtherAmount) public {
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
