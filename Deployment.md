DEVELOPMENT
$ node ./ethereum/compile-multi-sol.js
$ node ./ethereum/deploy-ethers-Storage.js
=> get hash and enter on etherscan to obtain contract address
=> save on config at key "F_STORAGE_ADDRESS"
$ node ./ethereum/deploy-ethers-Fabric.js
=> get hash and enter on etherscan to obtain contract address
=> save on config at key "FACTORY_ADDRESS"
Create contract: on Postman call localhost:5000/createcontract
Save contract on DB: on Postman call localhost:5000/savebyfabric
