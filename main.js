/*
 ** By Dave Amphlett
 **
 */


var atlas = require("atlas");

atlas.init(undefined);

module.exports.loop = function () {

    // Clean old creeps out of memory. This comes from the tutorial and is a
    // bit of necessary maintenance
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }

    atlas.loop();
}

