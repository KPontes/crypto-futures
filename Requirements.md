Next Sprint
05/11/2018

done 12/11/18 => Option unlock wallet and add user to Redux

* FutureContract -> Create a mapping liquidateTradeKeys
* Save tradeKey on liquidateTradeKeys (with manager key) whenever futureContractPooling liquidates a trade.
* Allow withdraw for every trade when the contract allowWitndraw flag = true OR
  trade is set as Liquidated. At Node API this is done, but still needs to be developed on Solidity as currently it is open and allows always withdraw.
* Implement order cancel on API and call on React MyOrders screen.
* Check balance on PlaceOrder.
* At createContract, listen for result and if status = 1, call savebyfabric.
* Monitor for orphan orders dbOnly after xx time and mark as failed
* ProcessLiquidation: Rollback trade to previous state on DB when fail on Blockchain
* Trade screen to show trades only after contract selection
* Allow sell position
* Evaluate change to crypto in React.
