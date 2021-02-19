'use strict';

var gMap, infoWindow;
var gMarkers = [];
var svgMarker; //custom marker


function initMap() {
    gMap = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: 29.556004, lng: 34.950038 }
    });

    svgMarker = {//custom marker configuration
        path:
            "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        fillColor: "blue",
        fillOpacity: 0.6,
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(15, 30),
    };

    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.innerHTML = "<img src='images/location.png' width='60' height='60'>";
    locationButton.classList.add("custom-map-control-button");
    gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    gMap.setCenter(pos);
                    addMarker(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, gMap.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, gMap.getCenter());
        }
    });
    addClickListener();

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input); //this locates the textbox inside the map so we don't want that
    // Bias the SearchBox results towards current map's viewport.
    gMap.addListener("bounds_changed", () => {
        searchBox.setBounds(gMap.getBounds());
    });

    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {

            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            //add to locations
            var coords = JSON.stringify(place.geometry.location.toJSON(), null, 2)
            var locationName =JSON.stringify(place['formatted_address']);
            _createLocation(locationName, coords);
            renderLocations();

            gMarkers.push(
                new google.maps.Marker({
                    map: gMap,
                    icon: svgMarker,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        gMap.fitBounds(bounds);
    });
}

//add listener for user click on the map so we can add a marker there
function addClickListener() {
    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(gMap, 'click', function (event) {
        addMarker(event.latLng);
        addLocation(JSON.stringify(event.latLng.toJSON(), null, 2));
        geocodeLatLng(geocoder, gMap, infowindow, event.latLng);
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(gMap);
}

function addMarker(coords) {


    var marker = new google.maps.Marker({
        position: coords,
        icon: svgMarker,
        map: gMap
    });
    gMarkers.push(marker);
    setMapOnAll(gMap);
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
                    icon: svgMarker,
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