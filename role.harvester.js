
var helper = require('helper');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.gather == undefined ){
            creep.memory.gather = true;
            console.log(creep.name+' initial gather mode');
        }
        if (creep.memory.gather) {
            if(creep.carry.energy < creep.carryCapacity) {
                var sources = creep.room.find(FIND_SOURCES);
                creep.say('harvesting');
                helper.harvestSource(creep, sources[0]);
            } else {
                creep.memory.gather = false;
                console.log(creep.name+' switching to replenish');
            }
        } else if (creep.carry.energy == 0) {
            creep.memory.gather = true;
            console.log(creep.name+' switching to gather');
        } else {
            var targets = creep.room.find(FIND_MY_STRUCTURES, {
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
            }
        }
    }
};

module.exports = roleHarvester;
