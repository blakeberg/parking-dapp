contract ParkingPlaces { 
    
    address public controller;
    uint public blockCosts;
    Place[] public places;
    mapping (address => Place) placeOf;

    struct Place {
        address owner;
        string name;
        string latitude;
        string longitude;
        Slot[] slots;
    }
    
    struct Slot {
        address parker;
        uint reservedBlock;
    }
    
    modifier isController() {
        if (controller != msg.sender) {
            throw;
        }
        else {
            _
        }
    }
    
    modifier isOwner(address owner) {
        if (owner != msg.sender) {
            throw;
        }
        else {
            _
        }
    }
    
    modifier hasValue() {
        if (msg.value > 0) {
            throw;
        }
        else {
            _
        }
    }
    
    event PlaceAdded(address place, string name, string latitude, string longitude);
    event SlotsAdded(address place, uint amount);
    event Reservation(address place, address parker, uint reservedBlock);
    event Transaction(address to, uint amount);
    
    function ParkingPlaces(uint _blockCosts) public {
        controller = msg.sender;
        blockCosts = _blockCosts;
    }
    
    function () hasValue public {
    }
    
    function existsPlace(address owner) constant public returns(bool exists) {
        for (uint i = 0; i < places.length; i++) {
            if (places[i].owner == owner) {
                return true;
            }
        }
        return false;
    }
    
    function addPlace(address owner, string name, string lat, string long) isController hasValue public {
        if (!existsPlace(owner)) {
            uint id = places.length++;
            places[id].owner = owner;
            places[id].name = name;
            places[id].latitude = lat;
            places[id].longitude = long;
            places[id].slots.push(Slot(msg.sender, block.number)); 
            PlaceAdded(owner, name, lat, long);
        }
    }
    
    function addSlots(address owner, uint amount) isOwner(owner) hasValue public {
        if (existsPlace(owner)) {
            for (uint i = 0; i < amount; i++) {
                placeOf[owner].slots.push(Slot(msg.sender, block.number));
            }
            SlotsAdded(owner, amount);
        }
    }
    
    function getSlotCount(address owner) constant public returns(uint count) {
        return placeOf[owner].slots.length;
    }
    
    function getFreeSlotCount(address owner, uint atBlock) constant public returns(uint count) {
        uint free = 0;
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].reservedBlock <= atBlock) {
                free++;
            }
        }
        return free;
    }
    
    function getNextFreeSlot(address owner, uint atBlock) constant public returns(uint block) {
        uint free = 0;
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (free == 0) {
                free = placeOf[owner].slots[i].reservedBlock;
            }
            else {
                if (placeOf[owner].slots[i].reservedBlock <= free) {
                    free = placeOf[owner].slots[i].reservedBlock;
                }
            }
        }
        return free;
    }
    
    function calculateEstimatedCosts (address owner, uint atBlock, uint toBlock) constant public returns(uint costs) {
        if (toBlock > atBlock) {
            return blockCosts * (toBlock - atBlock);
        }
    }
    
    function getReservedBlock(address owner, address parker) constant public returns(uint block) {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].parker == parker) {
                return placeOf[owner].slots[i].reservedBlock;
            }
        }
    }
    
    function reserveSlot(address owner, uint time) public {
        uint id = getNextFreeSlot(owner);
        payReservation(owner, time);
        placeOf[owner].slots[uint(id)].parker = msg.sender;
        placeOf[owner].slots[uint(id)].reservedBlock = time;
        Reservation(owner, msg.sender, time);
    }
    
    function payReservation(address owner, uint time) internal {
        uint amount = (time - block.number) * blockCosts;
        if (msg.value < amount) {
            throw;
        }
        oneTransaction(owner, amount);
        oneTransaction(msg.sender, msg.value - amount);
    }
    
    function oneTransaction(address to, uint amount) internal {
        to.send(amount);
        Transaction(to, amount);
    }
    
    function getNextFreeSlot(address owner) internal returns(uint id) {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].reservedBlock <= block.number) {
                return i;
            }
        }
        throw;
    }
    
    function close() isController {
        selfdestruct(controller);
    }
}