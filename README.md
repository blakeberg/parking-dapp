# parking-dapp
A Parking Dapp on Ethereum Blockchain.

The code `ParkingPlaces.sol` were published under `/contracts` in this repository. 

## Installing
**A docker container "geth-node" with geth and solc is already available**. You can also take the online compiler and connect them to local Ethereum client or docker container.

Starting Ethereum client for solidity online compiler.
`geth --testnet --rpc --rpcaddr "0.0.0.0" --rpccordomain "*"`

Look for installed compiler with `geth attach` and `eth.getCompilers()`. If there is no compiler `['Solidity']` install a compiler and link its path with `admin.setSolc("path/to/solc")`.

## Compile contract
With solidity online compiler or from JavaScript console of Ethereum client. 
It will also generates a Web3 deploy script used in next part.

> source is the ParkingPlaces.sol but formatted by removing line- and paragraph breaks to fit into a string variable.

	var compiled = web3.eth.compile.solidity(source);
	var contract = web3.eth.contract(compiled.ParkingPlaces.info.abiDefinition);
	var parkingplaces = contract.new(
		{from:web3.eth.accounts[0], data: compiled.TestContract.code, gas: 300000}, function(e, contract) {
    		if(!e) {
      			if(!contract.address) {
        			console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
      			} else {
        			console.log("Contract mined! Address: " + contract.address);
      			}
    		}
		}
	);

## Deploy contract
With solidity online compiler you can connect to Web3 Provider and deploy contracts directly.You have to unlook your account before. Or you deploy from JavaScript console of running Ethereum client with installed solc.

> The used JavaScript already includes the compile step!

1. create contract account from JavaScript console `loadScript('ParkingPlaces.js');`
2. you have to unlook your account with your passphrase
3. you will get a transaction with the contract creation
4. if transaction is mined you get the contract address

## Use contract

If you want to load an existing contract you need the ABI specification *(see link below or get it from solidity online compiler)* and the contract address:

	var abiDefinition = <paste abi JSON here>

If you have deployt before and still connected to JavaScript console you have the `var parkingplaces` defined.

1. Show methods type `parkingplaces`
2. Add place type `parkingplaces.AddPlace(eth.accounts[0], "Berlin", "52.5243700", "13.4105300", {from:eth.accounts[0], gas: 300000});`
3. Show place type `parkingplace.places()` and you get `["0x0212a53b6224ea371dd4201a8123a73edc4893de", "Berlin", true, "52.5243700", "13.4105300"]`
4. Add second place for another address (instead of `eth.account[0]`)
5. Show places by index type `parkingplace.places(1)`
6. Add slots for place type `parkingplaces.AddSlots(eth.accounts[0], 3, {from:eth.accounts[0], gas: 300000});`
7. Add an Event for Reservation notification:

	    var eventReservation = parkingplaces.Reservation({}, '', function(error, result){
	    if (!error)
	    	console.log("Reservation for place at " 
	    	+ result.args.place + " reserved from parker at " 
	    	+ result.args.parker + " until block number " + result.args.reservedBlock)
	    });
8. Add an Event for Transaction notification:

	    var eventTransaction = parkingplaces.Transaction({}, '', function(error, result){
	    if (!error)
	    	console.log("Payment from " 
	    	+ result.args.from + " to " 
	    	+ result.args.to + " with " + result.args.amount + " wei")
	    });

9. To reserve a slot for 15 blocks type `parkingplaces.ReserveSlot(eth.accounts[0], eth.blockNumber+15, {from:eth.accounts[0], gas: 300000, web3.toWei(500, "finney")});`
10. Get notifications from event like 

    	[1]
		Reservation for place at 0x3bee2a555de376981f9feb88b506062043c6a287 reserved from parker at 0x0212a53b6224ea371dd4201a8123a73edc4893de until block number 730416
		[2]
		Payment from 0x0212a53b6224ea371dd4201a8123a73edc4893de to 0x3bee2a555de376981f9feb88b506062043c6a287 with 130000000000000000 wei
		[3]
		Payment from 0x3bee2a555de376981f9feb88b506062043c6a287 to 0x0212a53b6224ea371dd4201a8123a73edc4893de with 370000000000000000 wei

	> [1] is your Reservation to block calculated from mining block (730403) so effective you reserved 13 blocks cause your eth.blockNumber was two blocks before.
	> [2] is your payment of 130 finney.
	> [3] is your payback of 370 finney.

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
- Line Break Removal Tool <http://www.textfixer.com/tools/remove-line-breaks.php>
- JSON formatter and validator <https://jsonformatter.curiousconcept.com>
