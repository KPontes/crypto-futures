pragma solidity 0.4.24;

contract IFutureContract {

    function createBuyOrder(
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public ;

    function getBuyOrder(string key) public view returns(address, uint, uint, uint, uint) ;

    function createSellOrder(
        string key,
        uint contractsAmount,
        uint margin,
        uint dealPrice
        ) payable public ;

    function getSellOrder(string key) public view returns(address, uint, uint, uint, uint) ;

    function validateOrder(address sender, uint value, uint contractsAmount) private view ;

    function createTrade(string tradeKey, string buyOrderKey, string sellOrderKey) public;

    function getTrade(string key) public view returns(uint, uint, uint, uint);

    function calculateLiquidation(string tradeKey, uint exitFactor, uint exitPrice) public;

    function tradeWithdraw(string tradeKey) public;

    function getStorageVars() public view returns(uint, uint, string, address);

    function calculateFee(uint etherValue) private pure returns(uint);

}
