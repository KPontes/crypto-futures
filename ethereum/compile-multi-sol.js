const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

//using this function ensures cross OS compatibility for the path
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

//const contractPath = path.resolve(__dirname, "contracts", "FutureStorage.sol");
const contractPath = path.resolve(__dirname, "contracts");
var input = {
  "IFutureStorage.sol": fs.readFileSync(
    `${contractPath}/IFutureStorage.sol`,
    "utf8"
  ),
  "FutureContractFactory.sol": fs.readFileSync(
    `${contractPath}/FutureContractFactory.sol`,
    "utf8"
  ),
  "FutureContract.sol": fs.readFileSync(
    `${contractPath}/FutureContract.sol`,
    "utf8"
  ),
  "FutureStorage.sol": fs.readFileSync(
    `${contractPath}/FutureStorage.sol`,
    "utf8"
  )
};
//const source = fs.readFileSync(contractPath, "utf8");
//const output = solc.compile(source, 1).contracts;
const output = solc.compile({ sources: input, optimize: 1 }, 1).contracts;

console.log("OUTPUT", output);
fs.ensureDirSync(buildPath); //creates the directory if not exists

for (let contract in output) {
  //write a json file, extracting until : from the name of the file
  //contract.replace(":", "")
  let pos = contract.indexOf(":");

  fs.outputJsonSync(
    path.resolve(
      buildPath,
      contract.substring(pos + 1, contract.length) + ".json"
    ),
    output[contract]
  );
}

//console.log(solc.compile(source, 1)); //source * the number of contracts being compiled
//module.exports = solc.compile(source, 1).contracts[':Lottery'];
