var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            creep.say('harvesting');
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                // check if we're in a holding pattern
                if (creep.memory.source_holding_pattern && creep.memory.source_holding_pattern > 0) {
                    var holdingFlag = Game.flags['SourceHoldingPattern'];
                    creep.moveTo(holdingFlag);
                    creep.memory.source_holding_pattern = creep.memory.source_holding_pattern - 1;
                    creep.memory.source_waiting_for = 0;
                    creep.say('->hold_'+creep.memory.source_holding_pattern);
                } else {
                    // check if we're blocking the source
                    creep.memory.source_holding_pattern = undefined;
                    if (creep.pos.getRangeTo(sources[0]) < 4) {
                        if (creep.memory.source_waiting_for) {
                            creep.memory.source_waiting_for = creep.memory.source_waiting_for + 1;
                        } else {
                            creep.memory.source_waiting_for = 1;
                        }
                        creep.say('->src|'+creep.memory.source_waiting_for);
                    }
                    if (creep.memory.source_waiting_for > 10) {
                        creep.memory.source_waiting_for = 0;
                        creep.memory.source_holding_pattern = 20;
                    } else {
                        creep.memory.source_waiting_for = 0;
                        creep.say('->source');
                        creep.moveTo(sources[0]);
                    }
                }
            }
        }
        else {
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
