contract ParkingPlaces { 
    
    address public controller;
    Place[] public places;
    mapping (address => Place) placeOf;
    mapping (address => uint) balanceOf;

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
    
    event PlaceAdded(address place, string name, string latitude, string longitude);
    event SlotsAdded(address place, uint amount);
    event Reservation(address place, address parker, uint reservedBlock);
    event Transaction(address from, address to, uint amount);

    function ParkingPlaces() {
        controller = msg.sender;
    }
    
    function ExistsPlace(address owner) constant public returns(bool exists) {
        for (uint i = 0; i < places.length; i++) {
            if (places[i].owner == owner) {
                return true;
            }
        }
        return false;
    }
    
    function AddPlace(address owner, string name, string lat, string long) public {
        if (!ExistsPlace(owner) && msg.sender == controller) {
            uint id = places.length++;
            places[id].owner = owner;
            places[id].name = name;
            places[id].latitude = lat;
            places[id].longitude = long;
            places[id].slots.push(Slot(msg.sender, block.number)); 
            PlaceAdded(owner, name, lat, long);
        }
    }
    
    function AddSlots(address owner, uint amount) public {
        if (ExistsPlace(owner) && msg.sender == owner) {
            for (uint i = 0; i < amount; i++) {
                placeOf[owner].slots.push(Slot(msg.sender, block.number));
            }
            SlotsAdded(owner, amount);
        }
    }
    
    function GetSlotCount(address owner) constant public returns(uint count) {
        return placeOf[owner].slots.length;
    }
    
    function GetFreeSlotCount(address owner, uint atBlock) constant public returns(uint count) {
        uint free = 0;
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].reservedBlock <= atBlock) {
                free++;
            }
        }
        return free;
    }
    
    function GetNextFreeSlot(address owner, uint atBlock) constant public returns(uint block) {
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
    
    function GetReservedBlock(address owner, address parker) constant public returns(uint block) {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].parker == parker) {
                return placeOf[owner].slots[i].reservedBlock;
            }
        }
    }
    
    function ReserveSlot(address owner, uint time) public {
        int id = GetNextFreeSlot(owner);
        if (id > -1) {
            PayReservation(owner, time);
            placeOf[owner].slots[uint(id)].parker = msg.sender;
            placeOf[owner].slots[uint(id)].reservedBlock = time;
            Reservation(owner, msg.sender, time);
        }
        else {
            PayReservation(owner, block.number);
        }
    }
    
    function PayReservation(address owner, uint time) internal {
        uint amount = (time - block.number) * 10 finney;
        OneTransaction(msg.sender, owner, amount);
        OneTransaction(owner, msg.sender, msg.value - amount);
    }
    
    function OneTransaction(address from, address to, uint amount) internal {
        from.send(uint256(-1) * amount);
        to.send(amount);
        Transaction(from, to, amount);
    }
    
    function GetNextFreeSlot(address owner) internal returns(int id) {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].reservedBlock <= block.number) {
                return int(i);
            }
        }
        return -1;
    }
    
    function close() public {
        if (msg.sender == controller) {
            selfdestruct(controller);
        }
    }
}