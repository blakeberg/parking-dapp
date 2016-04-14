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

> If you got an "Error in contract creation: Error: Contract transaction couldn't be found after 50 blocks" look for contract creation in blockchain explorer for you account and load it from contract address in next step.

## Use contract

If you want to load an existing contract you need the ABI specification *(see link below or get it from solidity online compiler)* and the contract address:

	var abiDefinition = <paste abi JSON here>
	var parkingplaces = web3.eth.contract(abiDefinition).at(<paste contract address>);

If you have deployt before and still connected to JavaScript console you have the `var parkingplaces` defined.

Show public methods, events and state variables type `parkingplaces`

**Message calls:**

* places `parkingplaces.places(<0..n>)` returns  array (owner, name, latitude, longitude)
* GetSlotCount `parkingplaces.GetSlotCount(<address>) ` returns number
* GetNextFreeSlot `parkingplaces.GetSlotCount(<address>, <blocknumber>) ` returns number
* GetFreeSlotCount `parkingplaces.GetFreeSlotCount(<address>, <blocknumber>) ` returns number
* ExistsPlace `parkingplaces.ExistsPlace(<address>) ` return boolean
* GetReservedBlock `parkingplaces.GetReservedBlock(<address>, <address>) ` *(place, parker)* returns number

> Get-methods returns 0 if place at address not exists so you should can check this before with method `ExistsPlace`.

To show how many places exists in contract storage type `eth.getStorageAt(<contract address>,1)`

**Transaction calls:**

* close 
* AddPlace
* AddSlots
* ReserveSlot 

> Transaction methods have no returns values but trigger events. You should also prove is an place for address exists.

You need an account to pay gas and/or transfer value `parkingplaces.<Methodname>([optional data], eth.accounts[0], 3, {from:eth.accounts[0], gas: 300000}, [optional value]);`

**Events:**

* PlaceAdded returns array (place, name, latitude, longitude)
* SlotsAdded returns array (place, amount, latitude, longitude)
* Reservation returns array (place, parker, reservedBlock)
* Payment returns array (from, to, amount)

### Register events

1. Add an Event for added place notification:

	    var eventPlaceAdded = parkingplaces.PlaceAdded({}, '', function(error, result){
	    if (!error)
	    	console.log("Place '" 
	    	+ result.args.name + "' added from " 
	    	+ result.args.place + " at latitude " + result.args.latitude
	    	+ "and longitude " + result.args.longitude)
	    });

2. Add an Event for added slots notification:

	    var eventSlotsAdded = parkingplaces.SlotsAdded({}, '', function(error, result){
	    if (!error)
	    	console.log(result.args.amount + " Slots added for place from " 
	    	+ result.args.place)
	    });

3. Add an Event for Reservation notification:

	    var eventReservation = parkingplaces.Reservation({}, '', function(error, result){
	    if (!error)
	    	console.log("Reservation for place at " 
	    	+ result.args.place + " reserved from parker at " 
	    	+ result.args.parker + " until block number " + result.args.reservedBlock)
	    });
4. Add an Event for Transaction notification:

	    var eventTransaction = parkingplaces.Transaction({}, '', function(error, result){
	    if (!error)
	    	console.log("Payment from " 
	    	+ result.args.from + " to " 
	    	+ result.args.to + " with " + result.args.amount + " wei")
	    });

> You can see triggert events also in Event Logs of a transaction in blockchain explorer.

### Adding places
A place is unique by its address (owner).

1. Add place type `parkingplaces.AddPlace(eth.accounts[0], "Berlin", "52.5243700", "13.4105300", {from:eth.accounts[0], gas: 300000});`
2. Show place type `parkingplaces.places()` and you get `["0x0212a53b6224ea371dd4201a8123a73edc4893de", "Berlin", true, "52.5243700", "13.4105300"]` without slot informations
3. Add second place for another address (instead of `eth.account[0]`)
4. Show places by index type `parkingplaces.places(1)`
5. Show count of places type `eth.getStorageAt(<contract address>,1)`
6. Validate if place exists type `parkingplaces.ExistsPlace(eth.accounts[0])`
7. Add slots for place type `parkingplaces.AddSlots(eth.accounts[0], 3, {from:eth.accounts[0], gas: 300000});`
8. Show slot count for place type `parkingplaces.GetSlotCount(eth.accounts[0])`
9. Show free slot count for place and current block type `parkingplaces.GetFreeSlotCount(eth.accounts[0], eth.blockNumber)` 
10. Show free slot count for place and current block type `parkingplaces.GetFreeSlotCount(eth.accounts[0], eth.blockNumber - 50)` gets 0 cause you added the slots with blocknumber of transaction.

> You will get notifications for added places and slots if you have it registered before.

### Reserving places
A reservation can be applied on slots and save the address of parker and a blocknumber until the reservation is valid.

1. To reserve a slot for 15 blocks type `parkingplaces.ReserveSlot(eth.accounts[0], eth.blockNumber+15, {from:eth.accounts[0], gas: 300000, value: web3.toWei(500, "finney")});`

	> If there are no slots free you get your value back and also payment events for this payback. 

2. Get notifications from events like 

    	[1]
		Reservation for place at 0x3bee2a555de376981f9feb88b506062043c6a287 reserved from parker at 0x0212a53b6224ea371dd4201a8123a73edc4893de until block number 730416
		[2]
		Payment from 0x0212a53b6224ea371dd4201a8123a73edc4893de to 0x3bee2a555de376981f9feb88b506062043c6a287 with 130000000000000000 wei
		[3]
		Payment from 0x3bee2a555de376981f9feb88b506062043c6a287 to 0x0212a53b6224ea371dd4201a8123a73edc4893de with 370000000000000000 wei

	> [1] is your Reservation to block calculated from mining block (730403) so effective you reserved 13 blocks cause your eth.blockNumber was two blocks before.
	> [2] is your payment of 130 finney.
	> [3] is your payback of 370 finney.

3. Show free slot count for place and current block type `parkingplaces.GetFreeSlotCount(eth.accounts[0], eth.blockNumber)` 
4. Show free slot count for place 15 blocks in futura type `parkingplaces.GetFreeSlotCount(eth.accounts[0], eth.blockNumber - 15)` gets all slots cause the added reservation is not valid at futura block.
5. Validate parkers reservation type `parkingplaces.GetReservedBlock(eth.accounts[0], eth.accounts[0]) - eth.blockNumber;` 
	* if the value is equals or greater than 0 the reservation is valid
	* if the value is equals eth.blockNumber but negativ the place or parker not exists
	* otherwise the reservation is in past

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
- Ethereum blockchain explorer for testnet <http://testnet.etherscan.io>
- Line Break Removal Tool <http://www.textfixer.com/tools/remove-line-breaks.php>
- JSON formatter and validator <https://jsonformatter.curiousconcept.com>
