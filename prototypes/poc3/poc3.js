if (Meteor.isClient) {

  const MAP_ZOOM = 15;
  const CENTER = {lat: 53.143722, lng: 8.214059};
  const TIMEOUT_ANIMATION = 200;
  const REFRESH_INTERVALL = 5;

  var block;
  var markers = [];
  var places = [];
  var placeInfos = [];
  var eventlogs = [];

  eventlogs.push("entry1");
  eventlogs.push("entry2");
  eventlogs.push("...");

  places["0x02b75fd3c9a0a023894556b22c9fc51001fd437b"] = ["0x02b75fd3c9a0a023894556b22c9fc51001fd437b", "Herbartgymnasium, Herbartstrasse", "53.140137", "8.206319"];
  places["0x3bee2a555de376981f9feb88b506062043c6a287"] = ["0x3bee2a555de376981f9feb88b506062043c6a287", "Caecilienschule, Haarenufer", "53.1411913", "8.2013645"];
  places["0x39e08a9d9bad38b42307ea04cb350980f85c51f9"] = ["0x39e08a9d9bad38b42307ea04cb350980f85c51f9", "Theater", "53.138848", "8.210621"];

  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Meteor.startup(function () {
    EthBlocks.init();
    EthAccounts.init();
    GoogleMaps.load();
  });

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

  Template.dapp.events({
    'click .dapp-block-button'(event) {
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
      event.preventDefault();
      var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
      showMessage("click .dapp-large", "click event for .dapp-large (account choosen: " + to + ")");
    },
    'change .block'(event) {
      event.preventDefault();
      block = event.target.value;
      showMessage("change .block", "change event for .block (block input: " + block + ")");
    }
  });

  Template.dapp.onCreated(function () {
    GoogleMaps.ready('map', function () {
      var i = 0;
      for (var key in places) {
        addMarkerWithTimeout(key, i * TIMEOUT_ANIMATION);
        i++;
      }
    });
  });

  function updateAllMarker(currentBlock) {
    //only every tenth block
    if ((currentBlock % REFRESH_INTERVALL) === 0) {
      for (var key in markers) {
        updateMarker(key, true, true);
      }
    }
  }

  function formatTS(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  function addMarkerWithTimeout(owner, timeout) {
    window.setTimeout(function () {
      var marker = new google.maps.Marker({
        title: places[owner][1],
        position: {lat: Number(places[owner][2]), lng: Number(places[owner][3])},
        map: GoogleMaps.maps.map.instance,
        animation: google.maps.Animation.DROP
      });
      markers[owner] = marker;
      addMarkerInfo(owner);
    }, timeout);
  }

  function addMarkerInfo(owner) {
    var marker = markers[owner];
    google.maps.event.clearInstanceListeners(marker);
    if (placeInfos[owner] !== undefined) {
      placeInfos[owner].setMap(null);
    }
    placeInfos[owner] = getPlaceInfowindow(owner);
    marker.addListener('click', function () {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      }
      if (placeInfos[owner] !== undefined) {
        placeInfos[owner].setMap(null);
      }
      placeInfos[owner] = getPlaceInfowindow(owner);
      placeInfos[owner].open(GoogleMaps.maps.map.instance, marker);
    });
  }

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

  function showMessage(header, message) {
    EthElements.Modal.show({
      template: 'modal_info',
      data: {
        header: header,
        message: message
      }
    });
  }

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
}

