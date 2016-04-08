# parking-dapp
A Parking Dapp on Ethereum Blockchain.

## contract 
ParkingPlaces.sol were published under `/contracts` in this repository. Starting Ethereum client for solidity online compiler.

`geth --testnet --rpc --rpcaddr "0.0.0.0" --rpccordomain "*"`

If you connect Web3 Provider you can deploy the contract directly from solidity online compiler.

### Web3 deploy

1. connect to JavaScript console of running Ethereum client: `geth attach`
2. create contract account from javascript `loadScript('ParkingPlaces.js');`
3. you have to unlook your account with your passphrase
4. you will get a transaction with the contract creation
5. if transaction is mined you get the contract address

> You can also deploy from online compiler but have to unlook your account before.

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