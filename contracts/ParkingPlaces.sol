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
    
    // Single slot on parking place reserved until `reservedBlock` by `parker`.
    struct Slot {
        // parker on slot initially the place owner
        address parker;
        // slot reserved until this block initially the block of its creation.
        uint reservedBlock;
    }
    
    /**
     * @notice Controller of the contract can add places for other, kill this
     * contract and change its ownership to another address.
     * @dev Assign owner of this contract at construction.
     */
    address controller = msg.sender;
    
    /** 
     * @dev Mapped state variable for (value = balance, key = address)
     * only available for contract internal payment function for reservations.
     */
    mapping (address => uint) private balances;
    
    /** 
     * @notice Mapped public state variable for (value = Place, key = name).
     * All places data is free available directly and everytime up to date.
     * @dev Available via automatically generated accessor function.
     */
    mapping (bytes32 => Place) places;
    
    /**
     * @notice Only controller can do this otherwise revert transaction.
     * @dev Controller initial the contract creation `msg.sender`,
     * have no balance and can change by himself to another address.
     * Validate with `msg.sender == controller` otherwise `throw`.
     */
    modifier only_controller() { 
        if (msg.sender != controller) { 
            throw; 
            _ 
        }
    } 
    
    /**
     * @notice Only place owner can do this otherwise revert transaction.
     * @dev Place owner is set by adding a place through controller. 
     * Place owner have balance from reservations and can update his place.
     * Validate with `msg.sender == places[name].owner` otherwise `throw`.
     */
    modifier only_placeowner(bytes32 name) { 
        if (msg.sender != places[name].owner) { 
            throw; 
            _ 
        }
    } 
    
    /**
     * @notice Only executes if reservedBlock is at least 50 blocks in future.
     * That means by 15sec Blocktime a minimum parking time of 12,5 min.
     * Otherwise the transaction will be reverted.
     * @dev Validate with `reservedBlock > block.number + 50` otherwise `throw`.
     */
    modifier only_future(uint reservedBlock) { 
        if (reservedBlock <= block.number + 50) { 
            throw; 
            _ 
        }
    } 
    
    /**
     * @notice Only executes if place is enabled otherwise reverts transaction.
     * @dev Validate with `places[name].enabled == true` otherwise `throw`.
     */
    modifier only_enabled(bytes32 name) { 
        if (places[name].enabled != true) { 
            throw; 
            _ 
        }
    }
    
    /**
     * @notice Only executes if place name not empty and not exists 
     * otherwise reverts transaction. Place names have to be unique.
     * @dev Validate with `places[name].name == 0 || name == ""` otherwise 
     * `throw`. 
     */
    modifier only_not_existing(bytes32 name) { 
        if (places[name].name != 0 && name != "") { 
            throw; 
            _ 
        }
    } 
    
        /**
     * @notice Only executes if place name not exists otherwise reverts 
     * transaction. Place names have to be unique.
     * @dev Validate with `places[name].name != 0` otherwise `throw`.
     * 
     */
    modifier only_existing(bytes32 name) { 
        if (places[name].name == 0) { 
            throw; 
            _ 
        }
    } 
    
    /**
     * @notice Event for updated place notifying clients and connected 
     * dapps that they can update their MVC.
     * @dev Can be watched with `ParkingPlaces.PlaceUpdated().watch(...);`.
     */
    event PlaceUpdated(bytes32 name);
    
    /**
     * @notice Event for reservation on place `name` for `address` 
     * until reserved block notifying clients and connected dapps.
     * @dev Can be watched with `ParkingPlaces.SlotReservation().watch(...);`.
     */
    event SlotReservation(bytes32 name, address parker, uint reservedBlock);
    
    /** 
     * @dev Gets next free slot `sid` on place `name` or `throw` if no slots 
     * are free. This is only visible for contract internal.
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
     * @dev The `msg.sender` becomes the controller and owner of this contract, 
     * can change its ownership, add places or close the contract.
     */
    function ParkingPlaces() {}
    
    /** 
     * @notice Change contract controller to `newController`.
     * Balances still holding by the place owners.
     * @dev If contract controller changed to contract address itself no places
     * can be added and the contract can never be closed.
     * @param newController The address of the new owner.
     */
    function ChangeController(address newController) only_controller {
        controller = newController;
    }
    
    /** 
     * @notice Create a parking reservation for place until reserved block.
     * An Event will be triggered to notify the watching client and dapps.
     * @dev The payment is made internally and the place owner is the receiver.
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
     * @dev Pay for reservation at place `name` only visible for contract 
     * internal. `throw` if send has not enough or an overflow occurs. 
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
     * @notice Update coordinates for parking place.
     * An Event will be triggered to notify the watching client and dapps.
     * @dev The coordinates will not be checked for validity.
     * @param name The name of the place.
     * @param newLocation The array with new coordinates of the place.
     * The format for Berlin for example is 
     * latitude: newLocation[0][0] = 52, newLocation[0][1] = 524370
     * longitude: newLoaction[1][0] = 13, newLocation[1][1] = 410530
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
     * @notice Add a diabled parking place without slots and trigger an event 
     * to notify the watching client and dapps.
     * @dev Place owner holds the balances and can later not be changed.
     * @param name The name of the place.
     * @param location The array with new coordinates of the place.
     * The format for Berlin for example is 
     * latitude: newLocation[0][0] = 52, newLocation[0][1] = 524370
     * longitude: newLoaction[1][0] = 13, newLocation[1][1] = 410530
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
     * @notice Adds amount of slots to parking place with owner as parker and
     * this block number as default.
     * An Event will be triggered to notify the watching client and dapps.
     * @dev push in for-loop a new slot to slots array of place.
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
     * An Event will be triggered to notify the watching client and dapps.
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
     * An Event will be triggered to notify the watching client and dapps.
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
