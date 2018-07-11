const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

//using this function ensures cross OS compatibility for the path
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const solPath = path.resolve(__dirname, "contracts", "FutureContract.sol");
const source = fs.readFileSync(solPath, "utf8");
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath); //creates the directory if not exists

for (let contract in output) {
  //write a json file, extracting the : from the name of the file
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}

//console.log(solc.compile(source, 1)); //source * the number of contracts being compiled
//module.exports = solc.compile(source, 1).contracts[':Lottery'];
