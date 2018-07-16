const web3 = require("./web3");
const FutureContractFactory = require("./build/FutureContractFactory.json");
const pk = "d798b3fd87852b15261d0ddb77965985fa6ab8c773ab31073af085e1167d0d8f";
const w3Provided = web3.web3WithProvider(pk);
const instance = new w3Provided.eth.Contract(
  JSON.parse(FutureContractFactory.interface),
  "0xAA14d66a51Be76feb2848d49662C5ed2ba012A6f"
);

module.exports = instance;
