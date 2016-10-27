
var helper = require('helper');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            creep.say('harvesting');
            helper.harvestSource(creep, sources[0]);
        }
        else {
            var targets = null;
            targets = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_SPAWN
                ) && structure.energy * 2 < structure.energyCapacity;
        }
        });
            if(targets.length > 0) {
                creep.say('replenishing structure');
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('->struct');
                    creep.moveTo(targets[0]);
                    console.log(creep.name+' moving to '+targets[0].pos+' to replenish it');
                }
                return;
            }
            targets = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER
                ) && structure.energy < structure.energyCapacity;
        }
        });
            if(targets.length > 0) {
                creep.say('replenishing structure');
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('->struct');
                    creep.moveTo(targets[0]);
                    console.log(creep.name+' moving to '+targets[0].pos+' to replenish it');
                }
                return;
            }
        }
    }
};

module.exports = roleHarvester;
