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
  //todo: read contract storage for count places
  const COUNT_PLACES = 18;
  
  //initialize web3 and address of json rpc api from (needs running ethereum client allowing rpc)
  if(typeof web3 === 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
  //EthBlocks with last 50 block information auto updating
  EthBlocks.init();
  
  // load contract with abi at specified address
  var parkingplaces = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
  var markers = []; 
  var placeInfos = [];
  
  //adding events from contract just to log oout in console
  var eventPlaceAdded = parkingplaces.PlaceAdded({}, '', function(error, result){
    if (!error)
      console.log("Place '" + result.args.name + "' added from " + result.args.place + " at latitude " 
        + result.args.latitude + " and longitude " + result.args.longitude)
    });
  var eventSlotsAdded = parkingplaces.SlotsAdded({}, '', function(error, result){
    if (!error)
      console.log(result.args.amount + " Slots added for place from " + result.args.place)
  });
  var eventReservation = parkingplaces.Reservation({}, '', function(error, result){
    if (!error)
      console.log("Reservation for place at " + result.args.place + " reserved from parker at " 
      + result.args.parker + " until block number " + result.args.reservedBlock)
  });
  var eventTransaction = parkingplaces.Transaction({}, '', function(error, result){
    if (!error)
      console.log("Payment to " + result.args.to + " with " + result.args.amount + " wei")
  });  
  
  //load google package at start
  Meteor.startup(function() {  
    GoogleMaps.load();
  });
  
  //template for block and time information
  Template.blockchain.helpers({
    currentBlockNumber: function() {
      return EthBlocks.latest.number;
    },
    currentBlockTime: function() {
      return formatTS(EthBlocks.latest.timestamp);
    } 
  });

  //template for map
  Template.map.helpers({  
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: CENTER,
          zoom: MAP_ZOOM
        };
      }
    }
  });
  
  //adding marker for each place
  Template.map.onCreated(function() {  
    GoogleMaps.ready('map', function(map) {
      for (var i = 0; i < COUNT_PLACES; i++) {
        addMarkerWithTimeout(map, parkingplaces.places(i), i * TIMEOUT_ANIMATION);
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
  
  function addMarkerWithTimeout(map, place, timeout) {
    //add marker at location of place from contract parkingplaces
    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        title: place[1],
        position: {lat: Number(place[2]), lng: Number(place[3])},
        map: map.instance,
        animation: google.maps.Animation.DROP
      });
      //add marker to array
      markers.push(marker);
      //adding information for each place
      addMarkerInfo(map, place, marker);
    }, timeout);
  }
  
  function addMarkerInfo(map, place, marker) {
    //add information of place and slot from contract parkingplaces
    var slotInfo = 
      '<li><b>name: </b>' + place[1] + '</li>' +
      '<li><b>owner: </b>' + place[0] + '</li>' +
      '<li><b>latitude: </b>' + place[2] + '</li>' +
      '<li><b>longitude: </b>' + place[3] + '</li>' +
      '<li><b>slots total: </b>' + parkingplaces.getSlotCount(place[0]) + '</li>' +
      '<li><b>slots free: </b>' + parkingplaces.getFreeSlotCount(place[0], EthBlocks.latest.number) + '</li>' +
      '<li><b>next free slot: </b>' + parkingplaces.getNextFreeSlot(place[0], EthBlocks.latest.number) + '</li>'
    var infowindow = new google.maps.InfoWindow({
      content: slotInfo
    });
    //add info window to array
    placeInfos.push(infowindow);
    //add info window as click event
    marker.addListener('click', function() {
      infowindow.open(map.instance, marker);
    });
  }
}
