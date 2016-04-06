contract ParkingPlaces { 
    
    // Located named parking place with slots and owner.
    struct Place {
        bytes32 name; 
        Slot[] slots;
        bool enabled;
        /* 
         * Two dimension array first with coordinates { latitude, longitude }
         * second with { numbers, decimals}
         */
        int16[2][2] location;
        address owner;
    }
    
    // Single slot on parking place reserved until `reservedBlock` by `parker`.
    struct Slot {
        uint reservedBlock;
        address parker;
    }
    
    // Owner and controller of this contract.
    address controller;
    
    // Mapped state variable for (value = balance, key = address).
    mapping (address => uint) balances;
    /*
     * Mapped public state variable for (value = Place, key = name)
     * with auto-generated accessor function.
     */
    mapping (bytes32 => Place) public places;
    
    // Validate if executed by controller. 
    modifier isController() { 
        if (msg.sender != controller) { 
            throw; 
            _ 
        }
    } 
    
    // Validate if executed by owner of place `name`. 
    modifier isPlaceOwner(bytes32 name) { 
        if (msg.sender != places[name].owner) { 
            throw; 
            _ 
        }
    } 
    
    // Validate if `reservedBlock` is at least 50 blocks in future. 
    modifier isFuture(uint reservedBlock) { 
        if (reservedBlock > block.number + 50) { 
            throw; 
            _ 
        }
    } 
    
    // Validate if place `name` is enabled. 
    modifier isEnabled(bytes32 name) { 
        if (places[name].enabled != true) { 
            throw; 
            _ 
        }
    }
    
    // Validate if place `name` is valid and does not exists. 
    modifier exists(bytes32 name) { 
        if (places[name].name != 0 && name != "") { 
            throw; 
            _ 
        }
    } 
    
    // Event for updated place `name` notifying clients and connected dapps.
    event placeUpdated(bytes32 name);
    
    /* 
     * Event for reservation on place `name` for `address` 
     * until `reservedBlock` notifying clients and connected dapps.
     */
    event slotReservation(bytes32 name, address parker, uint reservedBlock);
    
    /// Gets next free slot `sid` on place `name` or throw if no slots free. 
    function GetNextFreeSlot(bytes32 name) exists(name) returns (uint sid) { 
        for (uint i = 0; i < places[name].slots.length; i++) { 
            if (places[name].slots[i].reservedBlock <= block.number) {
                return i;
            }
        }
        throw;
    } 
    
    /// Create contract without parking places.
    function ParkingPlaces() isController {}
    
    /// Change contract controller.
    function ChangeController(address _controller) isController {
        controller = _controller;
    }
    
    /// Create a parking reservation for place `name` until `reservedBlock`.
    function ReserveSlot(bytes32 name, uint reservedBlock) 
        isFuture(reservedBlock)
        isEnabled(name) 
    {
        uint sid = GetNextFreeSlot(name);
        uint amount = (reservedBlock - block.number) * 10 finney;
        PayReservation(name, amount);
        places[name].slots[sid].parker = msg.sender;
        places[name].slots[sid].reservedBlock = reservedBlock;
        slotReservation(name, msg.sender, reservedBlock);
    }
    
    // Pay for reservation at place `name`.
    function PayReservation(bytes32 name, uint value) internal {
        // Check if the sender has enough. 
        if (balances[msg.sender] < value) {
            throw;
        }
        // Check for overflows.
        if (balances[places[name].owner] + value < 
            balances[places[name].owner]) 
        {
            throw; 
        }
        // Subtract from the sender
        balances[msg.sender] -= value;
        // Add the same to the recipient.
        balances[places[name].owner] += value;
    }
    
    /// Update coordinates `_location` for parking place `name`.
    function UpdatePlaceLocation(bytes32 name, int16[2][2] _location) 
        isPlaceOwner(name) 
        exists(name) 
    {
        places[name].location = _location;
        placeUpdated(name);
    }
    
    /// Add a parking place `name` at coordinates `location` for `owner`.
    function AddPlace(bytes32 name, int16[2][2] location, address owner) 
        isController 
        exists(name) 
    {
        places[name].name = name;
        places[name].enabled = false;
        places[name].location = location;
        places[name].owner = owner;
        placeUpdated(name);
    }
    
    /// Add `amount` slots to parking place `name`.
    function AddSlots(bytes32 name, uint amount) 
        isPlaceOwner(name) 
        exists(name) 
    {
        for (uint i = 0; i < amount; i++) {
            places[name].slots.push(Slot(block.number, msg.sender));
        }
    }
    
    /// Disable (open) parking place `name`.
    function DisablePlace(bytes32 name) isPlaceOwner(name) exists(name) { 
        places[name].enabled = false; 
        placeUpdated(name);
    }
    
    /// Enable (close) parking place `name`.
    function EnablePlace(bytes32 name) isPlaceOwner(name) exists(name) { 
        places[name].enabled = true; 
        placeUpdated(name);
    }
    
    // Fallback for invalid date or ether without data reverts transaction.
    function () { throw; }

    /// Close this contract and sends remaining funds back to creator.
    function close() isController {
        suicide(controller);  
    }
}
