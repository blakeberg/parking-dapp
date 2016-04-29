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
    
    modifier allowReservation(address owner) {
        if (owner == msg.sender || controller == msg.sender)
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
    event Transaction(
        address from, 
        address to, 
        uint transfered, 
        uint refund, 
        uint block);
    
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
    /// @notice get block number for next free slot
    /// @param owner unique place address
    /// @return block number for next free slot
    function getNextFreeBlock(address owner) 
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
    /// @param atBlock block number as start for calculation
    /// @param toBlock block number as end for calculation
    /// @return amount in wei to pay for block intervall
    function calculateEstimatedCosts (
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
    /// @return reserved block number and index in slots for place
    function getReservedBlock(address owner, address parker) 
        constant 
        public 
        returns (uint block, uint index) 
    {
        for (uint i = 0; i < placeOf[owner].slots.length; i++) {
            if (placeOf[owner].slots[i].parker == parker) 
                return (placeOf[owner].slots[i].reservedBlock, i);
        }
    }
    
    /// @dev throws if place not exists, old time or sender = (place|controller)
    /// @notice reserve a slot or extend existing reservation fires two events
    /// @param owner unique place address
    /// @param untilBlock until block number to reserve
    function reserveSlot(address owner, uint untilBlock) 
        allowReservation(owner)
        public 
    {
        if (untilBlock <= block.number || !existsPlace(owner))
            throw;
        var (reservedBlock, reservedId) = getReservedBlock(owner, msg.sender);
        uint id = 0;
        uint toReserve = untilBlock - block.number;
        if (reservedBlock == 0) {
            id = getNextFreeSlot(owner);
        }
        else {
            id = reservedId;
            if (untilBlock >= reservedBlock && reservedBlock >= block.number) {
                toReserve = untilBlock - reservedBlock;
            }
        }
        payReservation(owner, msg.sender, toReserve);
        placeOf[owner].slots[id].parker = msg.sender;
        placeOf[owner].slots[id].reservedBlock = untilBlock;
        Reservation(owner, msg.sender, untilBlock);
    }
    
    /// @dev called from reserveSlot and throws if given value is to low
    /// @param owner unique place address
    /// @param time number of blocks to pay
    function payReservation(address owner, address parker, uint time) internal {
        uint amount = time * blockCosts;
        if (msg.value < amount) 
            throw;
        owner.send(amount);
        parker.send(msg.value - amount);
        Transaction(msg.sender, owner, amount, msg.value - amount, time);
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