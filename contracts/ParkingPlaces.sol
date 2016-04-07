/** 
 * @title Contract for parking places and slot reservation.
 * @author bjoern.lakeberg@technik-emden.de
 */
contract ParkingPlaces { 
    
    // Located named parking place with slots and owner.
    struct Place {
        // Only on enabled places slots can be reserved.
        bool enabled;
        // Unique name will be checked in functions by modifier.
        bytes32 name; 
        // Owner that can add slots to place or enable/disable it.
        address owner;
        /* 
         * Two dimension array first with coordinates { latitude, longitude }
         * second with { numbers, decimals}
         */
        int24[2][2] location;
        // Dynamically-sized array for slots on a parking place.
        Slot[] slots;
    }
    
    // Single slot on parking place reserved until reservedBlock by parker.
    struct Slot {
        // parker on slot initially the place owner
        address parker;
        // slot reserved until this block initially the block of its creation.
        uint reservedBlock;
    }
    
    /*
     * Controller of the contract can add places for others, kill this
     * contract and change its ownership to another address.
     * Assign ownership of this contract at construction with msg.sender.
     */
    address controller = msg.sender;
    
    /* 
     * Mapped state variable for (value = balance, key = address)
     * only available for contract internal payment function for reservations.
     */
    mapping (address => uint) private balances;
    
    /* 
     * Mapped public state variable for (value = Place, key = name).
     * All places data is free available directly and everytime up to date.
     * Available via automatically generated accessor function.
     */
    mapping (bytes32 => Place) places;
    
    /*
     * Only controller can do this otherwise revert transaction.
     * Controller initial the contract creation msg.sender,
     * have no balance and can change by himself to another address.
     * Validate with msg.sender == controller otherwise throw.
     */
    modifier only_controller() { 
        if (msg.sender != controller) { 
            throw; 
            _ 
        }
    } 
    
    /*
     * Only place owner can do this otherwise revert transaction.
     * Place owner is set by adding a place through controller. 
     * Place owner have balance from reservations and can update his place.
     * Validate with msg.sender == places[name].owner otherwise throw.
     */
    modifier only_placeowner(bytes32 name) { 
        if (msg.sender != places[name].owner) { 
            throw; 
            _ 
        }
    } 
    
    /*
     * Only executes if reservedBlock is at least 50 blocks in future.
     * That means by 15sec Blocktime a minimum parking time of 12,5 min.
     * Otherwise the transaction will be reverted.
     * Validate with reservedBlock > block.number + 50 otherwise throw.
     */
    modifier only_future(uint reservedBlock) { 
        if (reservedBlock <= block.number + 50) { 
            throw; 
            _ 
        }
    } 
    
    /*
     * Only executes if place is enabled otherwise reverts transaction.
     * Validate with places[name].enabled == true otherwise throw.
     */
    modifier only_enabled(bytes32 name) { 
        if (places[name].enabled != true) { 
            throw; 
            _ 
        }
    }
    
    /*
     * Only executes if place name not empty and not exists 
     * otherwise reverts transaction. Place names have to be unique.
     * Validate with places[name].name == 0 || name == "" otherwise throw.
     */
    modifier only_not_existing(bytes32 name) { 
        if (places[name].name != 0 && name != "") { 
            throw; 
            _ 
        }
    } 
    
    /*
     * Only executes if place name not exists otherwise reverts 
     * transaction. Place names have to be unique.
     * Validate with places[name].name != 0 otherwise throw.
     * 
     */
    modifier only_existing(bytes32 name) { 
        if (places[name].name == 0) { 
            throw; 
            _ 
        }
    } 
    
    /*
     * Event for updated place notifying clients and connected 
     * dapps that they can update their MVC.
     * Can be watched with ParkingPlaces.PlaceUpdated().watch(...);.
     */
    event PlaceUpdated(bytes32 name);
    
    /*
     * Event for reservation on place name for address 
     * until reserved block notifying clients and connected dapps.
     * Can be watched with ParkingPlaces.SlotReservation().watch(...);.
     */
    event SlotReservation(bytes32 name, address parker, uint reservedBlock);
    
    /** 
     * @dev Gets next free slot or throw if no slots free.
     * @param name The name of the place.
     * @return The id as position in array.
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
    
    /** 
     * @notice Creates a contract without parking places.
     * @dev The msg.sender becomes the controller of this contract.
     */
    function ParkingPlaces() {}
    
    /** 
     * @notice Change controller that can add places or close this contract.
     * @param newController The address of the new owner.
     */
    function ChangeController(address newController) only_controller {
        controller = newController;
    }
    
    /** 
     * @notice Create a parking reservation for 10 finney per block (min 50).
     * @dev An Event will be triggered to notify the watchers.
     * @param name The name of the place.
     * @param reservedBlock The Block number until to reserve.
     */
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
    
    /** 
     * @dev Pay for reservation and throw if send has not enough or overflow. 
     * @param name The name of the place.
     * @param value The value to pay.
     */
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
    
    /** 
     * @notice Update coordinates (lat: [0][0].[0][1], long: [1][0].[1][1]).
     * @dev An Event will be triggered to notify the watchers.
     * @param name The name of the place.
     * @param newLocation The array with new coordinates of the place.
     */
    function UpdatePlaceLocation(bytes32 name, int24[2][2] newLocation) 
        only_placeowner(name) 
        only_existing(name) 
    {
        places[name].location = newLocation;
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /**
     * @notice Add a diabled parking place without slots.
     * @dev An Event will be triggered to notify the watchers.
     * @param name The name of the place.
     * @param location The array with new coordinates of the place.
     * @param owner The address for owner of the place.
     */
    function AddPlace(bytes32 name, int16[2][2] location, address owner) 
        only_controller 
        only_not_existing(name) 
    {
        places[name].name = name;
        places[name].enabled = false;
        places[name].location = location;
        places[name].owner = owner;
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /** 
     * @notice Adds slots with defaults (owner, block.number).
     * @dev An Event will be triggered to notify the watchers.
     * @param name The name of the place.
     * @param name The amount of slots adding to the place.
     */
    function AddSlots(bytes32 name, uint amount) 
        only_placeowner(name) 
        only_existing(name) 
    {
        for (uint i = 0; i < amount; i++) {
            places[name].slots.push(Slot(msg.sender, block.number));
        }
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /**
     * @notice Disable parking place for new reservations.
     * @dev An Event will be triggered to notify the watchers.
     * @param name The name of the place.
     */
    function DisablePlace(bytes32 name) 
        only_placeowner(name) 
        only_existing(name) 
    { 
        places[name].enabled = false; 
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /** 
     * @notice Enable parking place for reservations.
     * @dev An Event will be triggered to notify the watchers.
     * @param name The name of the place.
     */
    function EnablePlace(bytes32 name) 
        only_placeowner(name) 
        only_existing(name) 
    { 
        places[name].enabled = true; 
        // Triggering event that client and dapps can updating their MVC.
        PlaceUpdated(name);
    }
    
    /**
     * @notice This is an invalid call so the transaction will be reverted. 
     * @dev Fallback for invalid date or ether without data.
     */
    function () { 
        throw; 
    }

    /**
     * @notice Close this contract but place owner still holding their funds.
     * @dev Removes contracts bytecode and storage from current block to future.
     */
    function close() only_controller {
        selfdestruct(controller);  
    }
}
