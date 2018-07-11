const Web3 = require("web3");

let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  //we are in the browser && web3 has been injected so browser has metamask running
  web3 = new Web3(window.web3.currentProvider);
} else {
  // we are server-side, OR we are in the browser but without metamask
  //we will create a provider to connect ro Rinkeby through Infura
  const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/JCk41EvcUW5XJTBeriv4"
  );
  web3 = new Web3(provider);
}

module.exports = web3;
