pragma solidity 0.4.24;
//import "browser/StringUtils.sol" as strUtils;

contract IFutureStorage {
  function createOrder(
    address sender,
    uint8 orderType,
    bytes32 key,
    uint contractsAmount,
    uint margin,
    uint dealPrice,
    uint depositedEther,
    uint fees
    ) public;

   function getOrder(uint8 orderType, string key) public view returns(address, uint, uint, uint, uint);

   function createBuyOrder(
    address buyer,
    bytes32 key,
    uint contractsAmount,
    uint margin,
    uint dealPrice,
    uint depositedEther,
    uint fees
    ) private;

    function getBuyOrder(bytes32 keyByte) private view returns(address, uint, uint, uint, uint);

    function createSellOrder(
    address seller,
    bytes32 key,
    uint contractsAmount,
    uint margin,
    uint dealPrice,
    uint depositedEther,
    uint fees
    ) private;

    function getSellOrder(bytes32 keyByte) private view returns(address, uint, uint, uint, uint);

    function createTrade(bytes32 tradeKey, bytes32 buyOrderKey, bytes32 sellOrderKey) private;

    function getTrade(string key) public view returns(uint, uint, uint, uint, uint, uint, uint);

    function processLiquidation(bytes32 tradeByte, bytes32 buyByte, bytes32 sellByte, uint exitPrice) public;

    function tradeWithdraw(bytes32 tradeKey, address sender) public view returns (bool, uint);

    function setTradeWithdrawValues(bytes32 tradeKey, bool isBuyer, uint exitEtherAmount) public;
}
