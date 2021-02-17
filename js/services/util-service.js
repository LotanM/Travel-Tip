'use strict';
export const utilService = {
    getRandomId
}

function getRandomId() {
    return Math.random().toString(36).substr(2, 4);
}