//contract code in one single line
var ppSource = 'contract TestContract { address controller; Place[] public places; mapping (address => Place) place; struct Place { address owner; string name; bool enabled; string latitude; string longitude; Slot[] slots; } struct Slot { address parker; uint reservedBlock; } function TestContract() { controller = msg.sender; } function AddPlace(address _owner, string _name, string lat, string long) public { uint id = places.length++; places[id].owner = _owner; places[id].name = _name; places[id].enabled = true; places[id].latitude = lat; places[id].longitude = long; places[id].slots.push(Slot(msg.sender, block.number)); } function AddSlots(address owner, uint amount) public { for (uint i = 0; i < amount; i++) { place[owner].slots.push(Slot(msg.sender, block.number)); } } function ReserveSlots(address owner, uint time) public { if (time < block.number) { throw; } uint id = GetNextFreeSlot(owner); place[owner].slots[id].parker = msg.sender; place[owner].slots[id].reservedBlock = time; } function GetSlotInfo(address owner) constant public returns(uint[3] slot) { uint[3] memory slotInfo; slotInfo[0] = 0; slotInfo[1] = place[owner].slots.length; slotInfo[2] = 0; for (uint i = 0; i < place[owner].slots.length; i++) { if (place[owner].slots[i].reservedBlock <= block.number) { slotInfo[0] += 1; } if (place[owner].slots[i].reservedBlock < slotInfo[2]) { slotInfo[2] = place[owner].slots[i].reservedBlock; } } return slotInfo; } function GetNextFreeSlot(address owner) internal returns(uint id) { for (uint i = 0; i < place[owner].slots.length; i++) { if (place[owner].slots[i].reservedBlock <= block.number) { return i; } } return 0; } function close() { if (msg.sender == controller) { selfdestruct(controller); } } }';
//compile contract code
var ppCompiled = web3.eth.compile.solidity(ppSource);

//Creates a contract object for a solidity contract.
var ppContract = web3.eth.contract(ppCompiled.ParkingPlaces.info.abiDefinition);
//deploy contract to ethereum from first account with 300000 gas 
//error-first callback with first argument e as error and second argument contract as successful response
var pp = ppContract.new({from:web3.eth.accounts[0], data: ppCompiled.ParkingPlaces.code, gas: 300000}, function(e, contract){
    if(!e) {
      if(!contract.address) {
        console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
      } else {
        console.log("Contract mined! Address: " + contract.address);
      }
    }
});
