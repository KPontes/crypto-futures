const ethers = require("ethers");

exports.initialize = function(compiledContract, sk, contractAddress) {
  const provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
  const abi = JSON.parse(compiledContract.interface);
  var wallet = new ethers.Wallet(sk, provider);
  return {
    deployed: new ethers.Contract(contractAddress, abi, wallet),
    wallet: wallet,
    provider: provider
  };
};
