/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('service.codex');
 * mod.thing == 'a thing'; // true
 */

if (Memory.discoveries == undefined) {
    Memory.discoveries = {};
}

var serviceCodex = {
    run: function() {

    },

    discoveries: function() {
        return Memory.discoveries;
    },
    notDiscovered: function(id) {
        return (Memory.discoveries[id] == undefined);
    },
    discovered: function(id) {
        return ! this.notDiscovered(id);
    },
    discovery: function(id) {
        if (this.notDiscovered(id)) {
            Memory.discoveries[id] = {};
        }
        return Memory.discoveries[id];
    },
    setDiscoveryStatus: function(id, status) {
        this.discovery(id);
        Memory.discoveries[id].status = status;
    }

};

module.exports = serviceCodex;
