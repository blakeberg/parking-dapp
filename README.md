# parking-dapp
A Parking Dapp on Ethereum Blockchain.

## contract 
ParkingPlaces.sol and all docs above were published under `/contracts/docs` in this repository.

This contract was developed with online compiler and connected to docker container "geth-node" with started Ethereum client with:

`geth --testnet --rpc --rpcaddr "geth" --rpccordomain "*"`

> (Web3 Provider `http://geth:8545`)

### Web3 deploy
The paths depending on docker container containing the files too. *(link below)*

1. connect to JavaScript console of running Ethereum client: `geth attach`
2. create contract account from javascript `loadScript('/home/geth/contracts/ParkingPlaces.js');`
3. you have to unlook your account with your passphrase
4. you will get a transaction with the contract creation
5. if transaction is mined you get the contract address

> You can also deploy from online compiler and have to unlook account before.

### Natspec 

- `solc --userdoc /home/geth/contracts/ParkingPlaces.sol > pp-userdoc.json`
- `solc --devdoc /home/geth/contracts/ParkingPlaces.sol > pp-devdoc.json`

### Web3 deploy
The paths depending on docker container containing the files too. *(link below)*

1. connect to JavaScript console of running Ethereum client: `geth attach`
2. create contract account from javascript `loadScript('/home/geth/contracts/ParkingPlaces.js');`
3. you have to unlook your account with your passphrase
4. you will get a transaction with the contract creation *(this take a while)*
5. if transaction is mined you get the contract address

### ABI
Abstract binary interface `solc --abi /home/geth/contracts/ParkingPlaces.sol > pp-userdoc.json` (single line)

### AST
Abstract syntax tree `solc --ast-json /home/geth/contracts/ParkingPlaces.sol > pp-ast.json`

### ASM
Assembler source languge with Ethereum virtual machine opcodes

	`solc --asm-json /home/geth/contracts/ParkingPlaces.sol > pp-asm.json`

## Useful links
- Solidity online compiler <http://chriseth.github.io/browser-solidity>
- JSON formatter and validator <https://jsonformatter.curiousconcept.com>
- Ethereum Container <https://github.com/blakeberg/geth-node>