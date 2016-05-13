//single page application (SPA) needs access to google maps  and running ethereum client
if (Meteor.isClient) {
  //map constants
  const MAP_ZOOM = 15;
  const CENTER = {lat: 53.143722, lng: 8.214059};
  const TIMEOUT_ANIMATION = 200;
  //update all places and markers every x blocks
  const REFRESH_INTERVALL = 5;
  //rpc address of ethereum client
  const ETH_RPC_ADDRESS = 'http://localhost:8545';

  //initialize web3 and address of json rpc api from running ethereum client
  if (typeof web3 === 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider(ETH_RPC_ADDRESS));
  }

  //associative key-value arrays (first three with same index)
  var markers = [];
  var places = [];
  var placeInfos = [];
  var eventlogs = [];
  //selected block to estimate or parking
  var block;

  eventlogs.push("entry1");
  eventlogs.push("entry2");
  eventlogs.push("...");

  places["0x02b75fd3c9a0a023894556b22c9fc51001fd437b"] = ["0x02b75fd3c9a0a023894556b22c9fc51001fd437b", "Herbartgymnasium, Herbartstrasse", "53.140137", "8.206319"];
  places["0x3bee2a555de376981f9feb88b506062043c6a287"] = ["0x3bee2a555de376981f9feb88b506062043c6a287", "Caecilienschule, Haarenufer", "53.1411913", "8.2013645"];
  places["0x39e08a9d9bad38b42307ea04cb350980f85c51f9"] = ["0x39e08a9d9bad38b42307ea04cb350980f85c51f9", "Theater", "53.138848", "8.210621"];

  //call when meteor client starting
  Meteor.startup(function () {
    //EthBlocks with last 50 block information auto updating
    EthBlocks.init();
    EthAccounts.init();
    //load google package at start
    GoogleMaps.load();
  });

  //template for block and time information
  Template.dapp.helpers({
    currentBlockNumber: function () {
      updateAllMarker(EthBlocks.latest.number);
      return EthBlocks.latest.number;
    },
    currentBlockTime: function () {
      return formatTS(EthBlocks.latest.timestamp);
    },
    accounts: function () {
      return EthAccounts.find().fetch();
    },
    contractController: function () {
      return "hexhex";
    },
    contractParkingCosts: function () {
      return "0.0012 ETHER";
    },
    contractLogs: function () {
      return eventlogs;
    },
    estimatedParkingCosts: function () {
      return "0.0012 ETHER";
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
    'click .dapp-block-button'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
      EthElements.Modal.question({
        text: "click .dapp-block-button",
        ok: function () {
          console.log("click event for .dapp-block-button (account choosen: " + to + ")");
        },
        cancel: true
      });
    },
    'click .dapp-large'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
      showMessage("click .dapp-large", "click event for .dapp-large (account choosen: " + to + ")");
    },
    'change .block'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      block = event.target.value;
      showMessage("change .block", "change event for .block (block input: " + block + ")");
    }
  });

  //actions on template  creation - register contract events, load map and add markers foreach place in contract
  Template.dapp.onCreated(function () {
    //adding marker of google maps api for each place
    GoogleMaps.ready('map', function () {
      var i = 0;
      for (var key in places) {
        addMarkerWithTimeout(key, i * TIMEOUT_ANIMATION);
        i++;
      }
    });
  });

  /**
   * Update all marker in array without animating and centering
   * @param currentBlock actual block number cause updating only every x.th block
   */
  function updateAllMarker(currentBlock) {
    //only every tenth block
    if ((currentBlock % REFRESH_INTERVALL) === 0) {
      for (var key in markers) {
        updateMarker(key, true, true);
      }
    }
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
      addMarkerInfo(owner);
    }, timeout);
  }

  /**
   * Clear all listener for existing marker, create new click listener with infowindow
   * @param owner the place address and key for all key value array
   */
  function addMarkerInfo(owner) {
    //add info window as click event and remove existing animation and listener
    var marker = markers[owner];
    google.maps.event.clearInstanceListeners(marker);
    //close infowindow if existing
    if (placeInfos[owner] !== undefined) {
      placeInfos[owner].setMap(null);
    }
    //add info window to key-value-array
    placeInfos[owner] = getPlaceInfowindow(owner);
    //add click listener to stop animation, update and open infowindow
    marker.addListener('click', function () {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      }
      //close infowindow if existing
      if (placeInfos[owner] !== undefined) {
        placeInfos[owner].setMap(null);
      }
      //update and open
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
    var slotInfo =
        '<li><b>name: </b>' + places[owner][1] + '</li>' +
        '<li><b>owner: </b>' + owner + '</li>' +
        '<li><b>latitude: </b>' + places[owner][2] + '</li>' +
        '<li><b>longitude: </b>' + places[owner][3] + '</li>' +
        '<li><b>slots total: </b>' + 0 + '</li>' +
        '<li><b>slots free: </b>' + 0 + '</li>' +
        '<li><b>next free slot: </b>' + EthBlocks.latest.number + '</li>';
    return new google.maps.InfoWindow({
      content: slotInfo
    });
  }

  /**
   * Centers plus animate marker
   * @param owner the place address and key for all key value array
   */
  function updateMarker(owner, toCenter, toAnimate) {
    if (toCenter) {
      GoogleMaps.maps.map.instance.setCenter(markers[owner].getPosition());
    }
    if (toAnimate) {
      markers[owner].setAnimation(google.maps.Animation.BOUNCE);
    }
    else {
      markers[owner].setAnimation(null);
    }
    addMarkerInfo(owner);
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

