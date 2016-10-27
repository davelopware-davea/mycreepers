/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('helper');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    log_creeps: function() {
        console.log("Creeps:");
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            console.log("  "+name+": role="+creep.memory.role);
        }
    },
    log_structs: function(structs) {
        console.log("Structures:");
        for (var sidx in structs) {
            var structure = structs[sidx];
            console.log("  "+structure.id+": type="+structure.structureType);
        }
    },

    harvestSource: function(creep, source) {
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            // check if we're in a holding pattern
            if (creep.memory.source_holding_pattern && creep.memory.source_holding_pattern > 0) {
                var holdingFlag = Game.flags['SourceHoldingPattern'];
                creep.moveTo(holdingFlag);
                creep.memory.source_holding_pattern = creep.memory.source_holding_pattern - 1;
                creep.memory.source_waiting_for = 0;
                creep.say('->hold_'+creep.memory.source_holding_pattern);
                console.log(creep.name+' holding now for '+creep.memory.source_holding_pattern);

            } else {
                // check if we're blocking the source
                creep.memory.source_holding_pattern = undefined;
                if (creep.pos.getRangeTo(source) < 4) {
                    if (creep.memory.source_waiting_for) {
                        creep.memory.source_waiting_for = creep.memory.source_waiting_for + 1;
                    } else {
                        creep.memory.source_waiting_for = 1;
                    }
                    creep.say('->src|'+creep.memory.source_waiting_for);
                    console.log(creep.name+' source blocked now for '+creep.memory.source_waiting_for);
                }
                if (creep.memory.source_waiting_for > 10) {
                    creep.memory.source_waiting_for = 0;
                    creep.memory.source_holding_pattern = 5;
                    console.log(creep.name+' entering the holding pattern');
                } else {
                    creep.say('->source');
                    creep.moveTo(source);
                }
            }
        } else {
            creep.memory.source_waiting_for = undefined;
            creep.memory.source_holding_pattern = undefined;
        }
    },
    findMyClosestConstructable: function(pos, structType) {
        var target = null;
        if (structType) {
            target = pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                    filter: (c) => ((c.structureType === structType))
            });
        } else {
            target = pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        }
        return target;
    },
    findMyClosestRepairable: function(pos, structType, hitsPercentage) {
        var target = null;
        if (structType) {
            target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (s) => ((s.structureType === structType) && ((s.hits * 100 / hitsPercentage) < s.hitsMax))
            });
        } else {
            target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (s) => ((s.hits * 100 / hitsPercentage) < s.hitsMax)
            });
        }
        return target;
    },
    findClosestRepairable: function(pos, structType, hitsBelow) {
        var target = null;
        if (structType) {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => ((s.structureType === structType) && (s.hits < hitsBelow))
            });
        } else {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => (s.hits < hitsBelow)
            });
        }
        return target;
    }

};
