const ethers = require("ethers");

const provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
exports.provider = provider;
exports.initialize = function(compiledContract, sk, contractAddress) {
  const abi = JSON.parse(compiledContract.interface);
  var wallet = new ethers.Wallet(sk, provider);
  return new ethers.Contract(contractAddress, abi, wallet);
};
