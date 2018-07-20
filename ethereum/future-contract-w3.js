const web3 = require("./web3");
const FutureContract = require("./build/FutureContract.json");

//returns an instance of a deployed contract at the address received by parameter
export default address => {
  return new web3.eth.Contract(JSON.parse(FutureContract.interface), address);
};
