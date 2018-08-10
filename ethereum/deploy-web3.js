const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compiledContract = require("./build/FutureContractFactory.json");

//assign provider to deploy account and rinkebynetwork
const provider = new HDWalletProvider(
  "describe diamond reflect pulp practice spoon tide draw draft hello develop body",
  "https://rinkeby.infura.io/JCk41EvcUW5XJTBeriv4"
);

const web3 = new Web3(provider);

//just use a function in order to be able to use async await
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  // '0x' in front of the bytecode
  // https://ethereum.stackexchange.com/questions/47482/error-the-contract-code-couldnt-be-stored-please-check-your-gas-limit/47654#47654

  const result = await new web3.eth.Contract(
    JSON.parse(compiledContract.interface)
  )
    .deploy({
      data: "0x" + compiledContract.bytecode,
      arguments: ["Teste"]
    })
    .send({
      nonce: "10001",
      gas: "7000000",
      from: accounts[0]
    });

  console.log("Contract deployed to", result.options.address);
};
deploy();

// new web3.eth.Contract(JSON.parse(compiledContract.interface))
//   .deploy({
//     data: "0x" + compiledContract.bytecode,
//     arguments: ["Teste"]
//   })
//   .send({
//     nonce: "0x122",
//     gasLimit: "700000",
//     gasPrice: 30000,
//     from: accounts[0]
//   })
//   .once("transactionHash", function(txHash) {
//     console.log("transactionHash", txHash);
//   })
//   .once("confirmation", function(confirmationNumber, receipt) {
//     console.log("confirmation", confirmationNumber, receipt);
//   })
//   .once("receipt", function(receipt) {
//     console.log("receipt", receipt);
//   })
//   .once("error", function(error) {
//     console.log("error", error);
//   });

//Factoey1 deployed to 0x5A07532450cF071d6Ef041496083EdA0ab502316
//Factoey2 deployed to 0xfB477967C1e9E73E712398eDcAa20D7673D545B8
//Factory3 deployed to 0x2a19ABd75ef0001594eEF1be298585beFEd6E326
//Factory4 deployed to 0x51e423Bc5D86D54e48339210c3614069Ab9Df08d
//Factory5 deployed to 0x5fC5DCE68241548940bA37dDd8A27d2e8520CbeA
//Factory6 deployed to 0x8EC97F98b88d67f91bF8713DB9D3C96B0Dd9F911
