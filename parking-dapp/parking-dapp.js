//single page application (SPA) needs access to google maps api and running local ethereum client
if (Meteor.isClient) {
    //map constants
    const MAP_ZOOM = 15;
    const CENTER = {lat: 53.143722, lng: 8.214059};
    const TIMEOUT_ANIMATION = 200;
    //contract address
    const CONTRACT_ADDRESS = "0xded0a941b130e7617b5a3464cd43eab52e1f6793";
    //contract abstract binary interface in JSON format
    const CONTRACT_ABI = [
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "getSlotCount",
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "addSlots",
            "outputs": [],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "existsPlace",
            "outputs": [
                {
                    "name": "exists",
                    "type": "bool"
                }
            ],
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "close",
            "outputs": [],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "atBlock",
                    "type": "uint256"
                }
            ],
            "name": "getFreeSlotCount",
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "atBlock",
                    "type": "uint256"
                },
                {
                    "name": "toBlock",
                    "type": "uint256"
                }
            ],
            "name": "calculateEstimatedCosts",
            "outputs": [
                {
                    "name": "costs",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "blockCosts",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "atBlock",
                    "type": "uint256"
                }
            ],
            "name": "getNextFreeSlot",
            "outputs": [
                {
                    "name": "block",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "lat",
                    "type": "string"
                },
                {
                    "name": "long",
                    "type": "string"
                }
            ],
            "name": "addPlace",
            "outputs": [],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "parker",
                    "type": "address"
                }
            ],
            "name": "getReservedBlock",
            "outputs": [
                {
                    "name": "block",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "places",
            "outputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "latitude",
                    "type": "string"
                },
                {
                    "name": "longitude",
                    "type": "string"
                }
            ],
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "time",
                    "type": "uint256"
                }
            ],
            "name": "reserveSlot",
            "outputs": [],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "controller",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_blockCosts",
                    "type": "uint256"
                }
            ],
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "place",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "latitude",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "longitude",
                    "type": "string"
                }
            ],
            "name": "PlaceAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "place",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "SlotsAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "place",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "parker",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "reservedBlock",
                    "type": "uint256"
                }
            ],
            "name": "Reservation",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Transaction",
            "type": "event"
        }
    ];
    //associative key-value arrays
    var markers = [];
    var placeInfos = [];
    var places = [];
    var payments = [];
    //selected block to estimate or parking
    var block;

    //initialize web3 and address of json rpc api from (needs running ethereum client allowing rpc)
    if (typeof web3 === 'undefined') {
        web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    //EthBlocks with last 50 block information auto updating
    EthBlocks.init();
    EthAccounts.init();
    // load contract with abi at specified address
    var parkingplaces = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

    Meteor.startup(function () {
        //load google package at start
        GoogleMaps.load();
    });

    //template for block and time information
    Template.dapp.helpers({
        currentBlockNumber: function () {
            return EthBlocks.latest.number;
        },
        accounts: function () {
            return EthAccounts.find().fetch();
        },
        currentBlockTime: function () {
            return formatTS(EthBlocks.latest.timestamp);
        },
        contractController: function () {
            return parkingplaces.controller();
        },
        contractAddress: function () {
            return CONTRACT_ADDRESS;
        },
        contractParkingCosts: function () {
            return parkingplaces.blockCosts();
        },
        contractPayments: function () {
            console.log(EthBlocks.latest.number + " at " + formatTS(EthBlocks.latest.timestamp));
            return payments;
        },
        estimatedParkingCosts: function () {
            return parkingplaces.calculateEstimatedCosts(TemplateVar.getFrom('.to .dapp-address-input', 'value'),
                EthBlocks.latest.number, block);
        },
        mapOptions: function () {
            if (GoogleMaps.loaded()) {
                return {
                    center: CENTER,
                    zoom: MAP_ZOOM
                };
            }
        }
    });

    //handle events from dapp template
    Template.dapp.events({
        'submit .block'(event) {
            // Prevent default browser form submit
            event.preventDefault();
            var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
            if (isDataValid(to, event.target.block.value)) {
                block = event.target.block.value;
                var estimation = parkingplaces.calculateEstimatedCosts(to, EthBlocks.latest.number, block);
                showMessage("Estimated costs", "Your estimated costs for place " + to + " from block " +
                    EthBlocks.latest.number + " to block " + block + " is " + web3.fromWei(estimation, "ether") +
                    " ether");
            }
        },
        'click .dapp-block-button'(event) {
            // Prevent default browser form submit
            event.preventDefault();
            var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
            var estimation = parkingplaces.calculateEstimatedCosts(to, EthBlocks.latest.number, block);
            if (isDataValid(to, block)) {
                var msg = "Do you want to reserve place " + to + " until block " + block + " and pay " +
                    web3.fromWei(estimation, "ether") + " ether?";
                EthElements.Modal.question({
                    text: msg,
                    ok: function(){
                        var result = reservation(to, block, estimation);
                        console.log(result);
                    },
                    cancel: true
                });
            }
        }
    });

    //actions on creation - register contract events, load map and add markers foreach place in contract
    Template.dapp.onCreated(function () {
        //adding events from contract
        parkingplaces.PlaceAdded({}, '',
            /**
             * Action for event PlaceAdded of contract is to add a marker on map of google maps api
             * @param error first callback style
             * @param result with arguments (address place, string name, string latitude, string longitude)
             */
            function (error, result) {
                if (!error) {
                    places[result.args.place] =
                        [result.args.place, result.args.name, result.args.latitude, result.args.longitude];
                    addMarkerWithTimeout(result.args.place, TIMEOUT_ANIMATION);
                }
                else {
                    console.error(error);
                }
            }
        );
        parkingplaces.SlotsAdded({}, '',
            /**
             * Action for event SlotsAdded of contract is to update and animate marker on map of google maps api
             * @param error first callback style
             * @param result with arguments (address place, uint amount)
             */
            function (error, result) {
                if (!error) {
                    addMarkerInfo(result.args.place, markers[result.args.place]);
                    updateMarker(result.args.place);
                }
                else {
                    console.error(error);
                }
            }
        );
        parkingplaces.Reservation({}, '',
            /**
             * Action for event Reservation of contract is to show modal dialog if reservation come with your account
             * @param error first callback style
             * @param result with arguments (address place, address parker, uint reservedBlock)
             */
            function (error, result) {
                if (!error) {
                    addMarkerInfo(result.args.place, markers[result.args.place]);
                    updateMarker(result.args.place);
                    if (isOwnAccount(result.args.parker)) {
                        showMessage("Your reservation was successful", "for place at " + result.args.place +
                            " from parker at " + result.args.parker + " until block number " +
                            result.args.reservedBlock);
                    }
                }
                else {
                    console.error(error);
                }
            }
        );
        parkingplaces.Transaction({}, '',
            /**
             * Action for event Transaction of contract is to push sender and receiver details to payments array
             * if reservation come with your account
             * @param error first callback style
             * @param result with arguments (address fromOrigin, address to, uint amount)
             */
            function (error, result) {
                if (!error) {
                    if (isOwnAccount(result.args.fromOrigin)) {
                        payments.push("payed " + web3.fromWei(result.args.amount, "ether") + " ether");
                    }
                    if (isOwnAccount(result.args.to)) {
                        payments.push("got payback " + web3.fromWei(result.args.amount, "ether") + " ether");
                    }
                }
                else {
                    console.error(error);
                }
            }
        );
        //adding marker of google maps api for each place
        GoogleMaps.ready('map', function () {
            //load places from contract until exception
            var next = true;
            var i = 0;
            while (next === true) {
                try {
                    places[parkingplaces.places(i)[0]] = parkingplaces.places(i);
                    addMarkerWithTimeout(parkingplaces.places(i)[0], i * TIMEOUT_ANIMATION);
                    i++;
                }
                catch (e) {
                    next = false;
                }
            }
        });
    });

    /**
     * Verify if address exists as place with free slots in contract and block number is in future,
     * if not show a corresponding message for all cases
     * @param to address of a place in contract
     * @param block number to reserve or estimate costs
     * @returns {boolean} true if data valid
     */
    function isDataValid(to, block) {
        if (to === 'undefined') {
            showMessage("Data verification", "Please insert place address");
        }
        else {
            if (!parkingplaces.existsPlace(to)) {
                showMessage("Data verification", "Please insert an existing place address");
            }
            else {
                if (block === undefined || block <= EthBlocks.latest.number) {
                    showMessage("Data verification", "Please insert an block number in future");
                }
                else {
                    console.log(parkingplaces.getFreeSlotCount(to, EthBlocks.latest.number));
                    if (parkingplaces.getFreeSlotCount(to, EthBlocks.latest.number).equals(0)) {
                        showMessage("Data verification", "Please wait for free slots or take another place");
                    }
                    else {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     *
     * @param to
     * @param block
     * @param value
     * @returns {*}
     */
    function reservation(to, block, value) {
        var from = TemplateVar.getFrom('.from .dapp-select-account', 'value');
        return parkingplaces.reserveSlot(to, block, {from: from, gas: 300000, value: value});
    }

    /**
     * Checks if the address is one of your ethereum accounts
     * @param address an ethereum address
     * @returns {boolean} if the given address is one of your ethereum accounts
     */
    function isOwnAccount(address) {
        for (i = 0; i < EthAccounts.find().fetch().length; i++) {
            if (EthAccounts.find().fetch()[i].address === address) {
                return true;
            }
        }
        return false;
    }

    /**
     * Formatting of an unix timestamp to a 'hh:mm:ss' string
     * @param timestamp the unix timestamp of a block in seconds
     * @returns {string} time formatted as hh:mm:ss
     */
    function formatTS(timestamp) {
        var date = new Date(timestamp * 1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }

    /**
     * Add a new marker on map of google maps api and add infowindow with actual place data
     * @param owner the place address and key for all key value array
     * @param timeout for animated marker falling down
     */
    function addMarkerWithTimeout(owner, timeout) {
        //add marker at location of place from contract parkingplaces
        window.setTimeout(function () {
            var marker = new google.maps.Marker({
                title: places[owner][1],
                position: {lat: Number(places[owner][2]), lng: Number(places[owner][3])},
                map: GoogleMaps.maps.map.instance,
                animation: google.maps.Animation.DROP
            });
            //add marker to key-value-array
            markers[owner] = marker;
            //adding information for each place
            addMarkerInfo(owner, marker);
        }, timeout);
    }

    /**
     * Clear all listener for an existing marker, create a new click listener with actual infowindow
     * @param owner the place address and key for all key value array
     * @param marker {google.maps.Marker} an marker of google maps api
     */
    function addMarkerInfo(owner, marker) {
        //add info window as click event and remove existing animation and listener
        google.maps.event.clearInstanceListeners(marker);
        //add info window to key-value-array
        placeInfos[owner] = getPlaceInfowindow(owner);
        marker.addListener('click', function () {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            }
            placeInfos[owner] = getPlaceInfowindow(owner);
            placeInfos[owner].open(GoogleMaps.maps.map.instance, marker);
        });
    }

    /**
     * Generates an infowindow with aktual information about a place and its slots
     * @param owner the place address and key for all key value array
     * @returns {google.maps.InfoWindow} an infowindow of google maps api for marker
     */
    function getPlaceInfowindow(owner) {
        //add information of place and slot from contract parkingplaces
        var slotInfo =
            '<li><b>name: </b>' + places[owner][1] + '</li>' +
            '<li><b>owner: </b>' + owner + '</li>' +
            '<li><b>latitude: </b>' + places[owner][2] + '</li>' +
            '<li><b>longitude: </b>' + places[owner][3] + '</li>' +
            '<li><b>slots total: </b>' + parkingplaces.getSlotCount(owner) + '</li>' +
            '<li><b>slots free: </b>' + parkingplaces.getFreeSlotCount(owner, EthBlocks.latest.number) + '</li>' +
            '<li><b>next free slot: </b>' + parkingplaces.getNextFreeSlot(owner, EthBlocks.latest.number) + '</li>';
        return new google.maps.InfoWindow({
            content: slotInfo
        });
    }

    /**
     * Closes an opend infowindow, centers and animates updated marker
     * @param owner the place address and key for all key value array
     */
    function updateMarker(owner) {
        placeInfos[owner].close();
        GoogleMaps.maps.map.instance.setCenter(markers[owner].getPosition());
        markers[owner].setAnimation(google.maps.Animation.BOUNCE);
    }

    /**
     * Shows a modal dialog with header and message
     * @param header the header of a modal dialog
     * @param message the message of a modal dialag
     */
    function showMessage(header, message) {
        EthElements.Modal.show({
            template: 'modal_info',
            data: {
                header: header,
                message: message
            }
        });
    }
}
