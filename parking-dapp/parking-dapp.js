if (Meteor.isClient) {
  var MAP_ZOOM = 15;
  /*
  1: add event on each marker for hover to show dummy info
  2. add blockchain info with block number and block time (allways updating)
  3: read contract storage for count places
  4: loop
     for (int i = 0; i < count-1; i++) { 
       address = places(i)[0];
       name = places(i)[1];
       lat = places(i)[2];
       lng = places(i)[3];
     }
  5: add marker for each place
  6: add event for adding a place to add a new marker
  7: switch from dummy info on (1) to slot info [all: | free: | next free: ]
  */
  var places = []; //from contract
  var markers = []; //same index as places
  places.push({name: "Caecilienschule, Haarenufer", lat: "53.1411913", lng: "8.2013645"});
  places.push({name: "Herbartgymnasium, Herbartstrasse", lat: "53.140098", lng: "8.206351"});
  places.push({name: "Theater", lat: "53.138848", lng: "8.210621"});
  places.push({name: "Theaterwall", lat: "53.137521", lng: "8.211860"});
  places.push({name: "Kasinoplatz", lat: "53.138116", lng: "8.213750"});
  places.push({name: "Schlossplatz", lat: "53.137700", lng: "8.214797"});
  places.push({name: "Damm", lat: "53.135705", lng: "8.217888"});
  places.push({name: "Am Festungsgraben", lat: "53.136117", lng: "8.219527"});
  places.push({name: "Kanalstrasse, unter der Amalienbruecke", lat: "53.138573", lng: "8.224472"});
  places.push({name: "Stautor", lat: "53.140280", lng: "8.217801"});
  places.push({name: "Kaiserstrasse", lat: "53.141645", lng: "8.221610"});
  places.push({name: "Rosenstrasse", lat: "53.142636", lng: "8.218853"});
  places.push({name: "Bahnhof Sued", lat: "53.143749", lng: "8.221406"});
  places.push({name: "Bahnhof Nord, Willy-Brandt-Platz", lat: "53.145114", lng: "8.222248"});
  places.push({name: "Am Pferdemarkt", lat: "53.146410", lng: "8.212653"});
  places.push({name: "91er Strasse, unter Eisenbahnbruecke", lat: "53.145592", lng: "8.212663"});
  places.push({name: "Bruederstrasse", lat: "53.145527", lng: "8.209240"});
  places.push({name: "Katharinenstrasse, beim PFL", lat: "53.143351", lng: "8.207896"});

  Meteor.startup(function() {  
    GoogleMaps.load();
  });

  Template.map.helpers({  
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: {lat: 53.143722, lng: 8.214059},
          zoom: MAP_ZOOM
        };
      }
    }
  });
  
  Template.map.onCreated(function() {  
    GoogleMaps.ready('map', function(map) {
      
      for (var i = 0; i < places.length; i++) {
        addMarkerWithTimeout(map, places[i], i * 200);
      }
    });
  });
  
  function addMarkerWithTimeout(map, place, timeout) {
    window.setTimeout(function() {
      markers.push(new google.maps.Marker({
        title: place.name,
        position: {lat: Number(place.lat), lng: Number(place.lng)},
        map: map.instance,
        animation: google.maps.Animation.DROP
      }));
    }, timeout);
  }
}
