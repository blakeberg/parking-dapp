# parking-dapp
A Parking Dapp on Ethereum Blockchain.

## Deploy contract 
ParkingPlaces.sol were published under `/contracts` in this repository. Starting Ethereum client for solidity online compiler.

`geth --testnet --rpc --rpcaddr "0.0.0.0" --rpccordomain "*"`

If you connect Web3 Provider you can deploy the contract directly from solidity online compiler.
Then you have to unlook your account before. 
Or you deploy from JavaScript console of running Ethereum client.

1. create contract account from javascript `loadScript('ParkingPlaces.js');`
2. you have to unlook your account with your passphrase
3. you will get a transaction with the contract creation
4. if transaction is mined you get the contract address

> 

## Use contract

You have deployt before and still connected to JavaScript console.

1. Show methods type `parkingplaces`
2. Add place type `parkingplaces.AddPlace(eth.accounts[0], "Berlin", "52.5243700", "13.4105300", {from:eth.accounts[0], gas: 300000});`
3. Show place type `parkingplace.places()` and you get `["0x0212a53b6224ea371dd4201a8123a73edc4893de", "Berlin", true, "52.5243700", "13.4105300"]`
4. Add second place for another address (instead of `eth.account[0]`)
5. Show places by index type `parkingplace.places(1)`
6. Add slots for place type `parkingplaces.AddSlots(eth.accounts[0], 3, {from:eth.accounts[0], gas: 300000});`
7. Show slot info type `parkingplaces.GetSlotInfo(eth.accounts[0])` and you will get an array with first (free slots, slots, min slot time).
8. Reserve slot type `parkingplaces.ReserveSlots(eth.accounts[0], eth.blockNumber+50, {from:eth.accounts[0], gas: 300000});`
9. If you show slot info again you see one free slot less.

## Generate documentation

### Natspec 

- `solc --userdoc ParkingPlaces.sol > pp-userdoc.json`
- `solc --devdoc ParkingPlaces.sol > pp-devdoc.json`

### ABI
Abstract binary interface `solc --abi ParkingPlaces.sol > pp-userdoc.json` 

### AST
Abstract syntax tree `solc --ast-json ParkingPlaces.sol > pp-ast.json`

### ASM
Assembler source languge with Ethereum virtual machine opcodes

	`solc --asm-json ParkingPlaces.sol > pp-asm.json`

## Useful links
- Solidity online compiler <http://chriseth.github.io/browser-solidity>
- JSON formatter and validator <https://jsonformatter.curiousconcept.com>