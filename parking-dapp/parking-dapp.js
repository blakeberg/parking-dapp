if (Meteor.isClient) {
  const MAP_ZOOM = 15;
  const CENTER = {lat: 53.143722, lng: 8.214059};
  const TIMEOUT_ANIMATION = 200;
  const CONTRACT_ADDRESS = "0xded0a941b130e7617b5a3464cd43eab52e1f6793";
  const CONTRACT_ABI = [{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getSlotCount","outputs":[{"name":"count","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"amount","type":"uint256"}],"name":"addSlots","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"existsPlace","outputs":[{"name":"exists","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"close","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"atBlock","type":"uint256"}],"name":"getFreeSlotCount","outputs":[{"name":"count","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"atBlock","type":"uint256"},{"name":"toBlock","type":"uint256"}],"name":"calculateEstimatedCosts","outputs":[{"name":"costs","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"blockCosts","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"atBlock","type":"uint256"}],"name":"getNextFreeSlot","outputs":[{"name":"block","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"name","type":"string"},{"name":"lat","type":"string"},{"name":"long","type":"string"}],"name":"addPlace","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"parker","type":"address"}],"name":"getReservedBlock","outputs":[{"name":"block","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"places","outputs":[{"name":"owner","type":"address"},{"name":"name","type":"string"},{"name":"latitude","type":"string"},{"name":"longitude","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"time","type":"uint256"}],"name":"reserveSlot","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"controller","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[{"name":"_blockCosts","type":"uint256"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"place","type":"address"},{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"latitude","type":"string"},{"indexed":false,"name":"longitude","type":"string"}],"name":"PlaceAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"place","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"SlotsAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"place","type":"address"},{"indexed":false,"name":"parker","type":"address"},{"indexed":false,"name":"reservedBlock","type":"uint256"}],"name":"Reservation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Transaction","type":"event"}];
  
  if(typeof web3 === 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
  EthBlocks.init();
  /*
  3: read contract storage for count places
  6: add event for adding a place to add a new marker
  */
  var parkingplaces = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
  var markers = []; 
  var placeInfos = [];

  Meteor.startup(function() {  
    GoogleMaps.load();
  });
  
  Template.blockchain.helpers({
    currentBlockNumber: function() {
      return EthBlocks.latest.number;
    },
    currentBlockTime: function() {
      return EthBlocks.latest.timestamp - web3.eth.getBlock(web3.eth.blockNumber - 1).timestamp;
    }  
  });

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
  
  Template.map.onCreated(function() {  
    GoogleMaps.ready('map', function(map) {
      for (var i = 0; i < 18; i++) {
        addMarkerWithTimeout(map, parkingplaces.places(i), i * TIMEOUT_ANIMATION);
      }
    });
  });
  
  function addMarkerWithTimeout(map, place, timeout) {
    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        title: place[1],
        position: {lat: Number(place[2]), lng: Number(place[3])},
        map: map.instance,
        animation: google.maps.Animation.DROP
      });
      markers.push(marker);
      addMarkerInfo(map, place, marker);
    }, timeout);
  }
  
  function addMarkerInfo(map, place, marker) {
    var slotInfo = 
      '<li><b>owner:          </b>' + place[0] + '</li>' +
      '<li><b>slots total:    </b>' + parkingplaces.getSlotCount(place[0]) + '</li>' +
      '<li><b>slots free:     </b>' + parkingplaces.getFreeSlotCount(place[0], EthBlocks.latest.number) + '</li>' +
      '<li><b>next free slot: </b>' + parkingplaces.getNextFreeSlot(place[0], EthBlocks.latest.number) + '</li>'
    var infowindow = new google.maps.InfoWindow({
      content: slotInfo
    });
    placeInfos.push(infowindow);
    marker.addListener('click', function() {
      infowindow.open(map.instance, marker);
    });
  }
}
