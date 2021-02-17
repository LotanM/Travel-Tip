import { storageService } from './storage-service.js'
import { utilService } from './util-service.js'

export const mapService = {
    getLocs,
    _createLocation,
    _loadFromStorage,
    deletePlace
}
var locs = [{ lat: 11.22, lng: 22.11 }]
// var locs;
const LOCS_KEY = 'locations';

function getLocs() {
    locs = storageService.loadFromStorage(LOCS_KEY);
    if (!locs) locs = [];
    console.log('locs from storage')
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs);
        }, 2000)
    });
}
function deletePlace(locId) {
    let locationIdx = locs.findIndex(loc => {
        return locId === loc.id;
    });
    locs.splice(locationIdx, 1);
    storageService.saveToStorage(LOCS_KEY, locs);
}

function _loadFromStorage(){
    return storageService.loadFromStorage(LOCS_KEY);
}

function _createLocation(locationName, coords) {
    var coords =  JSON.parse(coords)
    let locations = locs;
    if (!locations || !locations.length) {
        locations = [];
    }
    let location = {
        id: utilService.getRandomId(),
        locationName,
        coords: {lat: coords.lat, lng: coords.lng},
        weather: null,
        createdAt: null,
        updatedAt: null,
    };
    locations.push(location);

    locs = locations;
    storageService.saveToStorage(LOCS_KEY, locs);
}

