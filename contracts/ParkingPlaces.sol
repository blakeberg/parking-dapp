contract ParkingPlaces { 
    
    address controller;
    Place[] public places;
    mapping (address => Place) placeOf;
    mapping (address => uint) balanceOf;

    struct Place {
        address owner;
        string name;
        bool enabled;
        string latitude;
        string longitude;
        Slot[] slots;
    }
    
    struct Slot {
        address parker;
        uint reservedBlock;
    }
    
    event Reservation(address place, address parker, uint reservedBlock);
    event Transaction(address from, address to, uint amount);

    function ParkingPlaces() {
        controller = msg.sender;
    }
    
    function AddPlace(address _owner, string _name, string lat, string long) public {
        uint id = places.length++;
        places[id].owner = _owner;
        places[id].name = _name;
        places[id].enabled = true;
        places[id].latitude = lat;
        places[id].longitude = long;
        places[id].slots.push(Slot(msg.sender, block.number));
    }
    
    function AddSlots(address owner, uint amount) public {
        for (uint i = 0; i < amount; i++) {
            placeOf[owner].slots.push(Slot(msg.sender, block.number));
        }
    }
    
    function ReserveSlot(address place, uint time) public {
        uint id = GetNextFreeSlot(place);
        PayReservation(place, time);
        placeOf[place].slots[id].parker = msg.sender;
        placeOf[place].slots[id].reservedBlock = time;
        Reservation(place, msg.sender, time);
    }
    
    function PayReservation(address place, uint time) internal {
        uint amount = (time - block.number) * 10 finney;
        OneTransaction(msg.sender, place, amount);
        OneTransaction(place, msg.sender, msg.value - amount);
    }
    
    function OneTransaction(address from, address to, uint amount) internal {
        from.send(uint256(-1) * amount);
        to.send(amount);
        Transaction(from, to, amount);
    }
    
    function GetNextFreeSlot(address place) internal returns(uint id) {
        for (uint i = 0; i < placeOf[place].slots.length; i++) {
            if (placeOf[place].slots[i].reservedBlock <= block.number) {
                return i;
            }
        }
    }
    
    function close() {
        if (msg.sender == controller) {
            selfdestruct(controller);
        }
    }
}