'use strict'

import { mapService } from './services/map-service.js'
import { weatherService } from './services/weather-service.js'

var gMap;
mapService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {
    // weatherService.onGetWeather();
    document.querySelector('.btn').addEventListener('click', (ev) => {
        console.log('Aha!', ev.target);
        panTo(35.6895, 139.6917);
    })
    initMap()
        .then(() => {
            addMarker({ lat: 32.0749831, lng: 34.9120554 });
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
                console.log('cityList', cityList);
                resolve(cityList);
            }
        }
        rawFile.send(null);
    })
}

// getCities("js/services/city.list.json", function (text) {
//     const cities = JSON.parse(text);
//     return cities;
// });


function getCityId(lat, lon) {
    lat = 31.816669
    lon = 34.650002

    // var latStr = lat + '';
    // var lonStr = lon + '';
    // let cityName = 'Tokyo'
    getCities()
        .then(cityList => cityList.find(city => {
            if (lon===city.coord.lon && lat===city.coord.lat) { console.log('city.id', city.id); weatherService.renderWeatherWidget(city.id); };
        }))
}

function initMap(lat = 32.0749831, lng = 34.9120554) {
    return _connectGoogleApi()
        .then(() => {
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            console.log('Map!', gMap);
            addClickListener();
        })
}



function addClickListener() {
    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(gMap, 'click', function (event) {
        addMarker(event.latLng);
        addLocation(JSON.stringify(event.latLng.toJSON(), null, 2));
        // geocodeLatLng(geocoder, map, infowindow, event.latLng);
    });
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
function addLocation(coords) {
    console.log('coords', coords);
    var locationName = prompt('Enter location name');
    mapService._createLocation(locationName, coords);
    renderLocations();
    let ctId = getCityId(JSON.parse(coords).lat, JSON.parse(coords).lng)
    console.log('ctId', ctId)
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
    var svgMarker = {//custom marker configuration
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
    return marker;
}





function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    gMap.panTo(laLatLng);
}



// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}







function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyDRCGVaa9zk3vR7iit1bTYkhEiOYg3eXbw';
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

window.onDelPlace = function (placeId) {
    console.log('placeId', placeId)
    mapService.deletePlace(placeId);
    renderLocations();
}


