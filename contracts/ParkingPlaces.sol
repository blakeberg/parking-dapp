contract ParkingPlaces { 
    
    // Located named parking place with slots and owner.
    struct Place {
        bytes32 name; 
        Slot[] slots;
        bool enabled;
        /* 
        Two dimension array first with coordinates { latitude, longitude }
        second with { numbers, decimals}
        */
        int16[2][2] location;
        address owner;
    }
    
    // Single slot on parking place reserved until `reservedBlock` by `parker`.
    struct Slot {
        uint reservedBlock;
        address parker;
    }
    
    /* 
    This state variable will be assigned at the construction
    controller = owner of this contract can be changed by owner himself.
    */
    address controller = msg.sender;
    
    /* 
    Mapped state variable for (value = balance, key = address)
    only visiable for contract internal.
    */
    mapping (address => uint) private balances;
    
    /*
    Mapped public state variable for (value = Place, key = name)
    with auto-generated accessor function.
    */
    mapping (bytes32 => Place) places;
    
    // Validate if executed by controller. 
    modifier only_controller() { 
        if (msg.sender != controller) { 
            throw; 
            _ 
        }
    } 
    
    // Validate if executed by owner of place `name`. 
    modifier only_placeowner(bytes32 name) { 
        if (msg.sender != places[name].owner) { 
            throw; 
            _ 
        }
    } 
    
    // Validate if `reservedBlock` is at least 50 blocks in future. 
    modifier only_future(uint reservedBlock) { 
        if (reservedBlock > block.number + 50) { 
            throw; 
            _ 
        }
    } 
    
    // Validate if place `name` is enabled. 
    modifier only_enabled(bytes32 name) { 
        if (places[name].enabled != true) { 
            throw; 
            _ 
        }
    }
    
    // Validate if place `name` is valid and does not exists. 
    modifier only_existing(bytes32 name) { 
        if (places[name].name != 0 && name != "") { 
            throw; 
            _ 
        }
    } 
    
    // Event for updated place `name` notifying clients and connected dapps.
    event PlaceUpdated(bytes32 name);
    
    /* 
    Event for reservation on place `name` for `address` 
    until `reservedBlock` notifying clients and connected dapps.
    */
    event SlotReservation(bytes32 name, address parker, uint reservedBlock);
    
    /* 
    Gets next free slot `sid` on place `name` or throw if no slots free
    only visible for contract internal.
    */
    function GetNextFreeSlot(bytes32 name) private only_existing(name) 
        returns (uint sid) 
    { 
        for (uint i = 0; i < places[name].slots.length; i++) { 
            if (places[name].slots[i].reservedBlock <= block.number) {
                return i;
            }
        }
        throw;
    } 
    
    /// Create contract without parking places.
    function ParkingPlaces() {}
    
    /// Change contract controller to `newController`.
    function ChangeController(address newController) only_controller {
        controller = newController;
    }
    
    /// Create a parking reservation for place `name` until `reservedBlock`.
    function ReserveSlot(bytes32 name, uint reservedBlock) 
        only_future(reservedBlock)
        only_enabled(name) 
    {
        uint sid = GetNextFreeSlot(name);
        uint amount = (reservedBlock - block.number) * 10 finney;
        PayReservation(name, amount);
        places[name].slots[sid].parker = msg.sender;
        places[name].slots[sid].reservedBlock = reservedBlock;
        // Triggering event that client and dapps can updating their MVC.
        SlotReservation(name, msg.sender, reservedBlock);
    }
    
    // Pay for reservation at place `name` only visible for contract internal.
    function PayReservation(bytes32 name, uint value) private {
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
    
    /// Update coordinates `newLocation` for parking place `name`.
    function UpdatePlaceLocation(bytes32 name, int16[2][2] newLocation) 
        only_placeowner(name) 
        only_existing(name) 
    {
        places[name].location = newLocation;
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /// Add a parking place `name` at coordinates `location` for `owner`.
    function AddPlace(bytes32 name, int16[2][2] location, address owner) 
        only_controller 
        only_existing(name) 
    {
        places[name].name = name;
        places[name].enabled = false;
        places[name].location = location;
        places[name].owner = owner;
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /// Add `amount` slots to parking place `name`.
    function AddSlots(bytes32 name, uint amount) 
        only_placeowner(name) 
        only_existing(name) 
    {
        for (uint i = 0; i < amount; i++) {
            places[name].slots.push(Slot(block.number, msg.sender));
        }
    }
    
    /// Disable (open) parking place `name`.
    function DisablePlace(bytes32 name) 
        only_placeowner(name) 
        only_existing(name) 
    { 
        places[name].enabled = false; 
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /// Enable (close) parking place `name`.
    function EnablePlace(bytes32 name) 
        only_placeowner(name) 
        only_existing(name) 
    { 
        places[name].enabled = true; 
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    // Fallback for invalid date or ether without data and reverts the tx.
    function () { 
        throw; 
    }

    /// Close this contract and sends remaining funds back to creator.
    function close() only_controller {
        selfdestruct(controller);  
    }
}
