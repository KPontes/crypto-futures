const Web3 = require("web3");

module.exports = {
  web3WithProvider: function() {
    if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
      //we are in the browser && web3 has been injected so browser has metamask running
      return new Web3(window.web3.currentProvider);
    } else {
      // we are server-side, OR we are in the browser but without metamask
      //we will create a provider to connect ro Rinkeby through Infura
      //const webSocketProvider = new Web3.providers.WebsocketProvider(
      const provider = new Web3.providers.HttpProvider(
        "https://rinkeby.infura.io/v3/57d315a3ee704eeeb57cf05ff872a94a"
      );
      // "https://rinkeby.infura.io/JCk41EvcUW5XJTBeriv4"
      return new Web3(provider);
    }
  }
};
