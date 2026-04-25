"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRoles = calculateRoles;
exports.fisherYatesShuffle = fisherYatesShuffle;
function calculateRoles(playerCount, isVoidEnabled) {
    let numMimics = 1;
    let numVoids = 0;
    // 1. Calculate Mimics based on your rules
    if (playerCount >= 9) {
        numMimics = 3;
    }
    else if (playerCount >= 7) {
        numMimics = 2;
    }
    // 2. Calculate Voids if the host enabled them
    if (isVoidEnabled) {
        if (playerCount >= 10) {
            numVoids = 2;
        }
        else if (playerCount >= 5) {
            numVoids = 1;
        }
    }
    // 3. The rest are Originals
    const numOriginals = playerCount - numMimics - numVoids;
    return { numMimics, numVoids, numOriginals };
}
function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//# sourceMappingURL=algorithmScript.js.map