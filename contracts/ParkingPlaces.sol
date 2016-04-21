/// @title Contract for Parking Places and Parking Reservations.
/// @author Bjoern Lakeberg
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
        if (controller != msg.sender) 
            throw;
        else 
            _
    }
    
    modifier isOwner(address owner) {
        if (owner != msg.sender) 
            throw;
        else 
            _
    }
    
    modifier hasValue() {
        if (msg.value > 0) 
            throw;
        else 
            _
    }
    
    event PlaceAdded(
        address place, 
        string name, 
        string latitude, 
        string longitude);
        
    event SlotsAdded(address place, uint amount);
    event Reservation(address place, address parker, uint reservedBlock);
    event Transaction(address fromOrigin, address to, uint amount);
    
    /// @dev msg.sender will set as controller
    /// @notice creation of this contract 
    /// @param _blockCosts costs per block
    function ParkingPlaces(uint _blockCosts) public {
        controller = msg.sender;
        blockCosts = _blockCosts;
    }
    
    /// @dev do nothing but throws if value is given 
    /// @notice fallback function rollback transaction if value present
    function () hasValue public {}
    
    /// @dev used public and intern in addPlace und addSlots 
    /// @notice verify if place with unique address exists
    /// @param owner unique place address
    /// @return if place exists
    function existsPlace(address owner) constant public returns (bool exists) {
        for (uint i = 0; i < places.length; i++) {
            if (places[i].owner == owner) 
                return true;
        }
        return false;
    }
    
    /// @dev only controller can add a place, throws if value is given 
    /// @notice add a new place fires an event
    /// @param owner unique place address
    /// @param name name of the place
    /// @param lat latitude coordinate
    /// @param long longitude coordinate
    function addPlace(address owner, string name, string lat, string long) 
        isController 
        hasValue 
        public 
    {
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
    
    /// @dev only place owner can add slots, throws if value is given 
    /// @notice add new slots to an existing place fires an event
    /// @param owner unique place address
    /// @param amount amount of slots to add
    function addSlots(address owner, uint amount) 
        isOwner(owner) 
        hasValue 
        public 
    {
        if (existsPlace(owner)) {
            for (uint i = 0; i < amount; i++) 
                placeOf[owner].slots.push(Slot(msg.sender, block.number));
            SlotsAdded(owner, amount);
        }
    }
    
    /// @dev if place not exists returns 0
    /// @notice count all slots for a place inluding reserved ones 
    /// @param owner unique place address
    /// @return count of all slots for a place
    function getSlotCount(address owner) constant public returns (uint count) {
        return placeOf[owner].slots.length;
    }
    
    /// @dev if place not exists or no slots free returns 0
    /// @notice count free slots for a place from given block number
    /// @param owner unique place address
    /// @param atBlock block number for searching free slots
    /// @return count of free slots
    function getFreeSlotCount(address owner, uint atBlock) 
        constant 
        public 
        returns (uint count) 
    {
        uint free = 0;
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].reservedBlock <= atBlock) 
                free++;
        }
        return free;
    }
    
    /// @dev if place not exists returns 0
    /// @notice get block number for next free slot from block number
    /// @param owner unique place address
    /// @param atBlock block number for searching next free slot
    /// @return block number for next free slot
    function getNextFreeSlot(address owner, uint atBlock) 
        constant
        public 
        returns (uint block) 
    {
        uint free = 0;
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (free == 0) 
                free = placeOf[owner].slots[i].reservedBlock;
            else {
                if (placeOf[owner].slots[i].reservedBlock <= free) 
                    free = placeOf[owner].slots[i].reservedBlock;
            }
        }
        return free;
    }
    
    /// @dev only if toBlock greater than atBlock else returns 0
    /// @notice calculate a reservation from intervall at block numbers 
    /// @param owner unique place address 
    /// @param atBlock block number as start for calculation
    /// @param toBlock block number as end for calculation
    /// @return amount in wei to pay for block intervall
    function calculateEstimatedCosts (
        address owner, 
        uint atBlock, 
        uint toBlock
    ) 
        constant 
        public 
        returns (uint costs) 
    {
        if (toBlock > atBlock) 
            return blockCosts * (toBlock - atBlock);
    }
    
    /// @dev if place not exists or parker not found returns 0
    /// @notice get the block number for a parker at place
    /// @param owner unique place address
    /// @param parker address to check for parking
    /// @return block number which is reserved for parker
    function getReservedBlock(address owner, address parker) 
        constant 
        public 
        returns (uint block) 
    {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].parker == parker) 
                return placeOf[owner].slots[i].reservedBlock;
        }
    }
    
    /// @dev calls internal functions for payment and transaction
    /// @notice reserve a slot for a place and time fires events
    /// @param owner unique place address
    /// @param time amount of blocks to reserve
    function reserveSlot(address owner, uint time) public {
        uint id = getNextFreeSlot(owner);
        payReservation(owner, time);
        placeOf[owner].slots[uint(id)].parker = msg.sender;
        placeOf[owner].slots[uint(id)].reservedBlock = time;
        Reservation(owner, msg.sender, time);
    }
    
    /// @dev called from reserveSlot and throws if given value is to low
    /// @param owner unique place address
    /// @param time of blocks to pay
    function payReservation(address owner, uint time) internal {
        uint amount = (time - block.number) * blockCosts;
        if (msg.value < amount) 
            throw;
        oneTransaction(owner, amount);
        oneTransaction(msg.sender, msg.value - amount);
    }
    
    /// @dev called from payReservation fires an event
    /// @param to address which receives payment
    /// @param amount amount to pay
    function oneTransaction(address to, uint amount) internal {
        to.send(amount);
        Transaction(msg.sender, to, amount);
    }
    
    /// @dev called from reserveSlot and throws if no free slot found
    /// @param owner unique place address
    /// @return id for next free slot in dynamic array
    function getNextFreeSlot(address owner) internal returns (uint id) {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].reservedBlock <= block.number) 
                return i;
        }
        throw;
    }
    
    /// @dev closing contract send value to its creator
    /// @notice close contract only for controller
    function close() isController {
        selfdestruct(controller);
    }
}