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
      data: "0x" + compiledContract.bytecode
    })
    .send({
      gas: "7000000",
      from: accounts[0]
    });

  console.log("Contract deployed to", result.options.address);
};
deploy();

//contract deployed to 0x5A07532450cF071d6Ef041496083EdA0ab502316
