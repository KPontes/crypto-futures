const web3 = require("./web3");
const FutureContractFactory = require("./build/FutureContractFactory.json");

const instance = new web3.eth.Contract(
  JSON.parse(FutureContractFactory.interface),
  "0xAA14d66a51Be76feb2848d49662C5ed2ba012A6f"
);

module.exports = instance;
