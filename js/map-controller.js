'use strict'
import { mapService } from './services/map-service.js'
import { weatherService } from './services/weather-service.js'


var svgMarker;
var gMap;
var gMarkers = [];
mapService.getLocs()
    .then(locs => console.log('locs', locs))


window.onload = () => {
    initMap()
        .then(() => {
            addMarker({ lat: 30.0749831, lng: 30.9120554 });
        })
        .catch(() => console.log('INIT MAP ERROR'));
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords);
        })
        .catch(err => {
            console.log('err!!!', err);
        })
}

function getCities(file = "js/services/city.list.json") {
    return new Promise((resolve, reject) => {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                let cityList = JSON.parse(rawFile.responseText);
                resolve(cityList);
            }
        }
        rawFile.send(null);
    })
}

function getCityId(lat, lon) {
    lat = 31.816669
    lon = 34.650002
    getCities()
        .then(cityList => cityList.find(city => {
            if (lon === city.coord.lon && lat === city.coord.lat) weatherService.renderWeatherWidget(city.id);;
        }))
}

function initMap(lat = 32.0749831, lng = 34.9120554) {
    return _connectGoogleApi()
        .then(() => {
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15,
                mapTypeId: "roadmap"
            })
        })
        .then(() => {
            addClickListener();
            initAutocomplete()
        })
        .then(() => getUsersLocation());
}

function getUsersLocation() {
    return new Promise((resolve, reject) => {
        var infoWindow = new google.maps.InfoWindow();
        const locationButton = document.querySelector('.my-location-btn');
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
                        addLocation(pos);
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
        resolve();
    })
}

function initAutocomplete() {
    return new Promise((resolve, reject) => {
        const input = document.getElementById("pac-input");
        const searchBox = new google.maps.places.SearchBox(input);
        gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        // Bias the SearchBox results towards current map's viewport.
        gMap.addListener("bounds_changed", () => {
            searchBox.setBounds(gMap.getBounds());
        });
        // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
        searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }
            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach((place) => {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                addMarker(JSON.parse(JSON.stringify(place.geometry.location)));
                mapService._createLocation(place.formatted_address, place.geometry.location);
                renderLocations();
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            gMap.fitBounds(bounds);
        });
        resolve();
    })
}

function addClickListener() {
    return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();
        const infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(gMap, 'click', function (event) {
            console.log('event.latLng', event.latLng);
            addMarker(JSON.parse(JSON.stringify(event.latLng.toJSON())));
            console.log('coords for add marker', JSON.parse(JSON.stringify(event.latLng.toJSON())))
            addLocation(JSON.parse(JSON.stringify(event.latLng.toJSON())));
            console.log('coords for addLocation', JSON.stringify(event.latLng.toJSON(), null, 2))
            geocodeLatLng(geocoder, gMap, infowindow, event.latLng);
        });
        resolve();
    })
}

function geocodeLatLng(geocoder, map, infowindow, coords) {
    geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                // map.setZoom(12);
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

function addLocation(coords) {
    var locationName = prompt('Enter location name');
    mapService._createLocation(locationName, coords);
    renderLocations();
    let ctId = getCityId(coords.lat, coords.lng)
    weatherService.renderWeatherWidget(ctId);
}

function renderLocations() {
    let locations = mapService._loadFromStorage();
    let strHTML = locations
        .map((location) => {
            return `<li class="list-item">
                    ${location.locationName}<br/>
                    <span>lat:${location.coords.lat}, lng:${location.coords.lng}</span>
                    <button class="delete-btn" type="button" onclick="onDelPlace('${location.id}')">Delete</button>
                    </li>`;
        }).join('');
    document.querySelector('.locations-container').innerHTML = strHTML;
}

function addMarker(loc) {
    return new Promise((resolve, reject) => {
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
        var marker = new google.maps.Marker({
            position: loc,
            icon: svgMarker,
            map: gMap,
            title: 'Hello World!'
        });
        gMarkers.push(marker);
        panTo(loc.lat, loc.lng);
        resolve();
    })
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    gMap.panTo(laLatLng);
}

function getPosition() {// This function provides a Promise API to the callback-based-api of getCurrentPosition
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyDRCGVaa9zk3vR7iit1bTYkhEiOYg3eXbw';
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

window.onDelPlace = function (placeId) {
    mapService.deletePlace(placeId);
    renderLocations();
}