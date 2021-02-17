'use strict';

var map, infoWindow;
var gMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: 29.556004, lng: 34.950038 }
    });
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.innerHTML = "<img src='images/location.png' width='60' height='60'>";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    map.setCenter(pos);
                    addMarker(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
    addClickListener();
}

//add listener for user click on the map so we can add a marker there
function addClickListener() {
    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, 'click', function (event) {
        addMarker(event.latLng);
        addLocation(JSON.stringify(event.latLng.toJSON(), null, 2));
        geocodeLatLng(geocoder, map, infowindow, event.latLng);
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

function addMarker(coords) {
    var marker = new google.maps.Marker({
        position: coords,
        map: map
    });
    gMarkers.push(marker);
    setMapOnAll(map);
}

function addLocation(coords) {
    var locationName = prompt('Enter location name');
    _createLocation(locationName, coords);
    renderLocations();
}

function setMapOnAll(map) {
    for (var i = 0; i < gMarkers.length; i++) {
        gMarkers[i].setMap(map);
    }
}

function geocodeLatLng(geocoder, map, infowindow, coords) {
    geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                map.setZoom(12);
                const marker = new google.maps.Marker({
                    position: coords,
                    map: map,
                });
                infowindow.setContent(results[0].formatted_address);
                infowindow.open(map, marker);
            } else {
                window.alert("No results found");
            }
        } else {
            window.alert("Geocoder failed due to: " + status);
        }
    });
}

function renderLocations() {
    let locations = _loadLocationsFromStorage();

    let strHTML = locations
        .map((location) => {
            return `<li class="list-item">
                    ${location.locationName}<br/>
                    <span>${location.coords}</span>
                    <button type="button" onclick="onDelPlace('${location.id}')">Delete</button>
                    </li>`;
        }).join('');
    document.querySelector('.locations-container').innerHTML = strHTML;
}

function onDelPlace(placeId) {
    deletePlace(placeId);
    renderLocations();
}