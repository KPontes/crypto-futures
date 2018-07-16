const { ObjectID } = require("mongodb");
const ethers = require("ethers");
const moment = require("moment");
require("dotenv").config();

require("../config/config.js");
const { mongoose } = require("../db/mongoose.js");
const compiledFactory = require("./build/FutureContractFactory.json");
const { FutureContract } = require("../models/futurecontract.js");

module.exports = {
  //pk from the contract creator account
  createFuture: function(pk, title, size, endDate) {
    return new Promise(async function(resolve, reject) {
      try {
        const abi = JSON.parse(compiledFactory.interface);
        var provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
        const factoryAddress = process.env.FACTORY_ADDRESS;
        size = size.toString();
        const sizeWei = ethers.utils.parseEther(size).toString(10);
        const initialDate = moment("1970-01-01");
        endDate = moment(endDate);
        const duration = moment.duration(endDate.diff(initialDate));
        const endDateSeconds = duration.asSeconds();
        var wallet = new ethers.Wallet(pk, provider);
        var contract = new ethers.Contract(factoryAddress, abi, wallet);

        var result = await contract.createFutureContract(
          title,
          sizeWei,
          endDateSeconds
        );
        var contractsAmount = await contract.getContractsAmount();
        var strAmount = contractsAmount.toString();
        var deployedFutureContract = await contract.deployedContracts(
          parseInt(strAmount) - 1
        ); //Address of last deployed future contract
        console.log("deployedFutureContract: ", deployedFutureContract);

        var futureContract = new FutureContract({
          address: deployedFutureContract,
          title: title,
          size: sizeWei,
          endDate: endDateSeconds,
          manager: wallet.address
        });

        futureContract.save().then(
          doc => {
            console.log("Saved document: ", doc);
            resolve(doc);
          },
          e => {
            console.log("Error: ", e);
            reject(e);
          }
        );
      } catch (e) {
        console.log("createFuture Error: ", e);
        reject(e);
      }
    });
  }
};
