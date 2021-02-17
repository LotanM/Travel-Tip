'use strict';

const LOCATIONS = 'locations';
var gLocations = [];


function _createLocation(locationName, coords) {
    let locations = _loadLocationsFromStorage();
    if (!locations || !locations.length) {
        locations = [];
    }
    let location = {
        id: getRandomId(),
        locationName,
        coords
    };
    locations.push(location);
    gLocations = locations;
    _saveLocationsToStorage();
}

function deletePlace(placeId) {
    let placeIdx = gLocations.findIndex(place => {
        return placeId === place.id;
    });
    gLocations.splice(placeIdx, 1);
    _saveLocationsToStorage();
}

function _loadLocationsFromStorage() {
    var locations = loadFromStorage(LOCATIONS);
    return locations;
}

function _saveLocationsToStorage() {
    saveToStorage(LOCATIONS, gLocations)
}