import { storageService } from './storage-service.js'
export const mapService = {
    getLocs
}
// var locs = [{ lat: 11.22, lng: 22.11 }]
var locs;
const LOCS_KEY = 'locations';

function getLocs() {
    locs = storageService.loadFromStorage(LOCS_KEY);
    if(!locs) locs=[];
    console.log('locs from storage')
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs);
        }, 2000)
    });
}


