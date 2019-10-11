var helper = require('helper');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            creep.say('u$');
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.say('u->$');
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            creep.say('u+');
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                helper.harvestSource(creep, sources[0], 'u');
            }
        }
    }
};

module.exports = roleUpgrader;
