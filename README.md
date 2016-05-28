# Dapp Parking Places
A Parking Dapp on Ethereum Blockchain.
## User interface
See on own section <https://github.com/blakeberg/parking-dapp/tree/master/ui>

## Contract
The code `ParkingPlaces.sol` were published under `/contracts` in this repository. 
**It is verified under** 

1. <https://morden.ether.camp/account/ad3d7d21862dfa1f9d91569240a9ed06ac276b4d>
2. <http://testnet.etherscan.io/address/0xad3d7d21862dfa1f9d91569240a9ed06ac276b4d#code>

### Installing
**A docker container "geth-node" with geth and solc is already available**. You can also take the online compiler and connect them to local Ethereum client or docker container.

Starting Ethereum client for solidity online compiler.
`geth --testnet --rpc --rpcaddr "0.0.0.0" --rpccorsdomain "*"`

Look for installed compiler with `geth attach` and `eth.getCompilers()`. If there is no compiler `['Solidity']` install a compiler and link its path with `admin.setSolc("path/to/solc")`.

### Compile contract
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

### Deploy contract
With solidity online compiler you can connect to Web3 Provider and deploy contracts directly.You have to unlook your account before. Or you deploy from JavaScript console of running Ethereum client with installed solc.

> The used JavaScript already includes the compile step!

1. create contract account from JavaScript console `loadScript('path/to/ParkingPlaces.js');`
2. you have to unlook your account with your passphrase
3. you will get a transaction with the contract creation
4. if transaction is mined you get the contract address

> If you got an "Error in contract creation: Error: Contract transaction couldn't be found after 50 blocks" look for contract creation in blockchain explorer for you account and load it from contract address in next step.

### Use contract

If you want to load an existing contract you need the ABI specification *(see link below or get it from solidity online compiler)* and the contract address:

	var abiDefinition = <paste abi JSON here>
	var parkingplaces = web3.eth.contract(abiDefinition).at(<paste contract address>);

If you have deployt before and still connected to JavaScript console you have the `var parkingplaces` defined.
Show public methods, events and state variables type `parkingplaces`. For more details look at contract and ABI.

**Message calls:**

* places
* controller
* blockCosts
* getSlotCount
* getNextFreeBlock
* getFreeSlotCount
* existsPlace
* getReservedBlock
* calculateEstimatedCosts

> Get-methods returns 0 if place at address not exists so you should check this before with method `existsPlace`.

**Transaction calls:**

* close *(only controller)*
* addPlace *(only controller)*
* addSlots *(only place owner)*
* reserveSlot *(not for controller or place owner)*

> Transaction methods have no returns values but trigger events. You should also prove if an place for address exists. Only for slot reservation a sufficient value is needed else a throw will reverts the transaction.

You need an account to pay gas and/or transfer value `parkingplaces.<Methodname>([optional data], eth.accounts[0], 3, {from:eth.accounts[0], gas: 300000}, [optional value]);`

**Events:**

* PlaceAdded
* SlotsAdded
* Reservation
* Transaction

#### Register events

1. Add an Event for added place notification:

	    var eventPlaceAdded = parkingplaces.PlaceAdded({}, '', function(error, result){
	    if (!error)
	    	console.log("Place '" 
	    	+ result.args.name + "' added from " + result.args.place + " at latitude " 
	    	+ result.args.latitude + " and longitude " + result.args.longitude);
	    });

2. Add an Event for added slots notification:

	    var eventSlotsAdded = parkingplaces.SlotsAdded({}, '', function(error, result){
	    if (!error)
	    	console.log(result.args.amount + " Slots added for place from " + result.args.place);
	    });

3. Add an Event for Reservation notification:

	    var eventReservation = parkingplaces.Reservation({}, '', function(error, result){
	    if (!error)
	    	console.log("Reservation for place at " + result.args.place + " reserved from parker at " 
	    	+ result.args.parker + " until block number " + result.args.reservedBlock);
	    });

4. Add an Event for Transaction notification:

	    var eventTransaction = parkingplaces.Transaction({}, '', function(error, result){
	    if (!error)
	    	console.log("Payment from " + result.args.from + " to " + result.args.to + " for " + result.args.block + 
			" blocks with " + result.args.transfered + " wei" + " and payback " + result.args.refund);
	    });

> You can see triggered events also in Event Logs of a transaction in blockchain explorer.

#### Places and Slots
A place is unique by its address (owner) in this example address `eth.accounts[0]`.

1. Add place type `parkingplaces.addPlace(eth.accounts[0], "Berlin", "52.5243700", "13.4105300", {from:eth.accounts[0], gas: 300000});`
2. Show place type `parkingplaces.places()` and you get `["0x0212a53b6224ea371dd4201a8123a73edc4893de", "Berlin", true, "52.5243700", "13.4105300"]` without slot informations
3. Add second place for another address (instead of `eth.account[0]`)
4. Show places by index type `parkingplaces.places(1)`
5. Validate if place exists type `parkingplaces.existsPlace(eth.accounts[0])`
6. Add slots for place type `parkingplaces.addSlots(eth.accounts[0], 3, {from:eth.accounts[0], gas: 300000});`
7. Show slot count for place type `parkingplaces.getSlotCount(eth.accounts[0])`
8. Show free slot count for place and current block type `parkingplaces.getFreeSlotCount(eth.accounts[0], eth.blockNumber)` 
9. Show free slot count for place and current block type `parkingplaces.getFreeSlotCount(eth.accounts[0], eth.blockNumber - 50)` gets 0 cause you added the slots with blocknumber of transaction.

> You will get notifications for added places and slots if you have it registered before.

#### Reservation and Payment
A reservation can be applied on slots and save the address of parker and a blocknumber until the reservation is valid. You can also extend an existing and active reservation and pay only the difference.

> Notice that place owners and contract controller cannot make reservations so create a seperate account for a parker to make reservations.

1. To calculate estimated costs for a 15 blocks reservation at place type `parkingplaces.calculateEstimatedCosts(eth.blockNumber, eth.blockNumber + 15)`

2. To reserve a slot for 15 blocks at place `eth.accounts[0]` type `parkingplaces.reserveSlot(eth.accounts[0], eth.blockNumber+15, {from:<parker account>, gas: 300000, value: web3.toWei(500, "finney")});`

	> A rollback occurs if there are no slots free, place not exists or a insufficent value is given. 

3. Get two notifications from events (one for reservation and one for transaction)

4. Show free slot count for place and current block type `parkingplaces.getFreeSlotCount(eth.accounts[0], eth.blockNumber)` 
5. Show free slot count for place 15 blocks in futura type `parkingplaces.getFreeSlotCount(eth.accounts[0], eth.blockNumber - 15)` gets all slots cause the added reservation is not valid at futura block.
6. Validate parkers reservation type `parkingplaces.getReservedBlock(eth.accounts[0], <parker account>)[0] - eth.blockNumber;` 
	* if the value is equals or greater than 0 the reservation is valid
	* if the value is equals eth.blockNumber but negativ the place or parker not exists
	* otherwise the reservation is in past

### Initialize parking city
This is the initialization of this contract for the city Oldenburg in Germany with 18 parking places as this example. For this if you should start from scratch with on account with at least 10 Ether in it.

> You can show parking places and slots for Oldenburg at a map *(see link below)*

1. If you have more than one account for testnet backup the accounts beyond the main account:
	* Show accounts for testnet type `geth --testnet account list` *(if you only have on account go to 2.)*
	* Go to keystore for testnet type `cd ~/.ethereum/testnet/keystore` and make backup folder `mkdir backup`
	* Move key files for account older than the main account type `mv UTC--<time beyond>* /backup`
	* Show accounts for testnet type `geth --testnet account list` *(now you should only have the main account)*
2. Create Accounts for parking places
	* Attach to JavaScript console type `geth attach` if Ethereum client is running
	* Load JavaScript to create and unlock accounts and transfer 0.5 Ether to it from main account type `loadScript('path/to/CreateParkingPlacesAccounts.js');`
		> If you have to unlook your account it is your main account and then only once.
		> This take a while cause for each account a transaction is done.
	* Show balance for all accounts:

			var i = 0; 
			eth.accounts.forEach( function(e){
    			console.log("  eth.accounts["+i+"]: " +  e + " \tbalance: " + web3.fromWei(eth.getBalance(e), "ether") + " ether"); 
    			i++; 
			}) 

3. Deploy Contract from main account *(see above)*
4. Create Places in deployed contract from your accounts
	* Load JavaScript to create real parking places from its place account type `loadScript('path/to/CreateParkingPlaces.js');`
	* Show balance for all accounts *(see above)*
5. Now you can verify all places
	* `parkingplaces.places(0)` to `parkingplaces.places(17)` shows a place
	* `parkingplaces.existsPlace(eth.accounts[1])` to `parkingplaces.existsPlace(eth.accounts[18])` is true
6. Add Slots to existing places
	* Load JavaScript to create slots for parking places from its place account type `loadScript('path/to/CreateParkingPlacesSlots.js');`
	* Show balance for all accounts *(see above)*
7. Now you can verify all slots
	* `parkingplaces.getSlotCount(eth.accounts[1])`to `parkingplaces.getSlotCount(eth.accounts[18])` is between 18 and 401
	* `parkingplaces.getFreeSlotCount(eth.accounts[1], eth.blockNumber)` to `parkingplaces.getFreeSlotCount(eth.accounts[18], eth.blockNumber)` is between 18 and 401
	* `parkingplaces.getFreeSlotCount(eth.accounts[1], eth.blockNumber-100)` to `parkingplaces.getFreeSlotCount(eth.accounts[18], eth.blockNumber - 100)` is allways 0
	* `parkingplaces.getNextFreeSlot(eth.accounts[1], eth.blockNumber)` to `parkingplaces.getNextFreeSlot(eth.accounts[1], eth.blockNumber)` is allways lower than `eth.blockNumber`

### Generate documentation

#### Natspec 

- `solc --userdoc ParkingPlaces.sol > pp-userdoc.json`
- `solc --devdoc ParkingPlaces.sol > pp-devdoc.json`

#### ABI
Abstract binary interface `solc --abi ParkingPlaces.sol > pp-userdoc.json` 

#### AST
Abstract syntax tree `solc --ast-json ParkingPlaces.sol > pp-ast.json`

#### ASM
Assembler source languge with Ethereum virtual machine opcodes

	`solc --asm-json ParkingPlaces.sol > pp-asm.json`

### Useful links
- Solidity online compiler <http://chriseth.github.io/browser-solidity>
- Blockchain Explorer for Testnet <http://testnet.etherscan.io>
- Line Break Removal Tool <http://www.textfixer.com/tools/remove-line-breaks.php>
- JSON formatter and validator <https://jsonformatter.curiousconcept.com>
- Ethereum Container <https://github.com/blakeberg/geth-node>
- Map with Parking places in city Oldenburg(Germany) <http://gis4oldenburg.oldenburg.de/?es=C12S14>
