//single page application (SPA) needs access to google maps api and running local ethereum client
if (Meteor.isClient) { 
  //map constants
  const MAP_ZOOM = 15;
  const CENTER = {lat: 53.143722, lng: 8.214059};
  const TIMEOUT_ANIMATION = 200;
  //contract address
  const CONTRACT_ADDRESS = "0xded0a941b130e7617b5a3464cd43eab52e1f6793";
  //contract abstract binary interface (very long ;)
  const CONTRACT_ABI = [{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getSlotCount","outputs":[{"name":"count","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"amount","type":"uint256"}],"name":"addSlots","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"existsPlace","outputs":[{"name":"exists","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"close","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"atBlock","type":"uint256"}],"name":"getFreeSlotCount","outputs":[{"name":"count","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"atBlock","type":"uint256"},{"name":"toBlock","type":"uint256"}],"name":"calculateEstimatedCosts","outputs":[{"name":"costs","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"blockCosts","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"atBlock","type":"uint256"}],"name":"getNextFreeSlot","outputs":[{"name":"block","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"name","type":"string"},{"name":"lat","type":"string"},{"name":"long","type":"string"}],"name":"addPlace","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"parker","type":"address"}],"name":"getReservedBlock","outputs":[{"name":"block","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"places","outputs":[{"name":"owner","type":"address"},{"name":"name","type":"string"},{"name":"latitude","type":"string"},{"name":"longitude","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"time","type":"uint256"}],"name":"reserveSlot","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"controller","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[{"name":"_blockCosts","type":"uint256"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"place","type":"address"},{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"latitude","type":"string"},{"indexed":false,"name":"longitude","type":"string"}],"name":"PlaceAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"place","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"SlotsAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"place","type":"address"},{"indexed":false,"name":"parker","type":"address"},{"indexed":false,"name":"reservedBlock","type":"uint256"}],"name":"Reservation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Transaction","type":"event"}];
  //associative key-value arrays
  var markers = []; 
  var placeInfos = [];
  var places = [];
  
  //initialize web3 and address of json rpc api from (needs running ethereum client allowing rpc)
  if(typeof web3 === 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
  //EthBlocks with last 50 block information auto updating
  EthBlocks.init();
  EthAccounts.init();
  // load contract with abi at specified address
  var parkingplaces = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS); 
  
  Meteor.startup(function() {  
    //load google package at start
    GoogleMaps.load();
  });
  
  //template for block and time information
  Template.dapp.helpers({
    currentBlockNumber: function() {
      return EthBlocks.latest.number;
    },
    accounts: function () {
      return EthAccounts.find().fetch();
    },
    currentBlockTime: function() {
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
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: CENTER,
          zoom: MAP_ZOOM
        };
      }
    }
  });
  
  Template.dapp.onCreated(function() {  
    //adding events from contract
    var eventPlaceAdded = parkingplaces.PlaceAdded({}, '', function(error, result){
      if (!error) {
        console.log("Place '" + result.args.name + "' added from " + result.args.place + " at latitude " 
          + result.args.latitude + " and longitude " + result.args.longitude);
        places[result.args.place] = [result.args.place, result.args.name, result.args.latitude, result.args.longitude];
        addMarkerWithTimeout(result.args.place, TIMEOUT_ANIMATION);
      }
    });
    var eventSlotsAdded = parkingplaces.SlotsAdded({}, '', function(error, result){
      if (!error) {
        console.log(result.args.amount + " Slots added for place from " + result.args.place);
        addMarkerInfo(result.args.place, markers[result.args.place]);
        updateMarker(result.args.place);
      }
    });
    var eventReservation = parkingplaces.Reservation({}, '', function(error, result){
      if (!error) {
        console.log("Reservation for place at " + result.args.place + " reserved from parker at " 
          + result.args.parker + " until block number " + result.args.reservedBlock);
        updateMarker(result.args.place);
      }
    });
    var eventTransaction = parkingplaces.Transaction({}, '', function(error, result){
      if (!error)
        console.log("Payment to " + result.args.to + " with " + result.args.amount + " wei")
    }); 
    GoogleMaps.ready('map', function(map) {
      //adding marker for each place
      var next = true;
      var i = 0;
      while (next === true) {
        try {
          places[parkingplaces.places(i)[0]] = parkingplaces.places(i);
          addMarkerWithTimeout(parkingplaces.places(i)[0], i * TIMEOUT_ANIMATION);
          i++;
        }
        catch(e) {
          next = false;
        }
      }
    });
  });
  
  function formatTS(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  function addMarkerWithTimeout(owner, timeout) {
    //add marker at location of place from contract parkingplaces
    window.setTimeout(function() {
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
  
  function addMarkerInfo(owner, marker) {
    //add info window as click event and remove existing animation and listener
    google.maps.event.clearInstanceListeners(marker);
    marker.addListener('click', function() {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      }
      //add information of place and slot from contract parkingplaces
      var slotInfo = 
        '<li><b>name: </b>' + places[owner][1] + '</li>' +
        '<li><b>owner: </b>' + owner + '</li>' +
        '<li><b>latitude: </b>' + places[owner][2] + '</li>' +
        '<li><b>longitude: </b>' + places[owner][3] + '</li>' +
        '<li><b>slots total: </b>' + parkingplaces.getSlotCount(owner) + '</li>' +
        '<li><b>slots free: </b>' + parkingplaces.getFreeSlotCount(owner, EthBlocks.latest.number) + '</li>' +
        '<li><b>next free slot: </b>' + parkingplaces.getNextFreeSlot(owner, EthBlocks.latest.number) + '</li>';
      var infowindow = new google.maps.InfoWindow({
        content: slotInfo
      });
      //add info window to key-value-array
      placeInfos[owner] = infowindow;
      infowindow.open(GoogleMaps.maps.map.instance, marker);
    });
  }

  function updateMarker(owner) {
    //close opened info window and animate marker
    placeInfos[owner].close();
    markers[owner].setAnimation(google.maps.Animation.BOUNCE);
  }
}
