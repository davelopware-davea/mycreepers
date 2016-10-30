
var helper = require('helper');
var foreman = require('service.foreman');

var sroleRoadMaintain = {

    spawn: function(spawner, memory) {
        spawner.createCreep([MOVE,WORK,CARRY,ATTACK], undefined, memory);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var myOwner = Game.flags[creep.memory.flagBase].owner;
        var basePos = Game.flags[creep.memory.flagBase].pos;
        var remotePos = Game.flags[creep.memory.flagRemote].pos;
        if (creep.memory.direction === 'out') {
            if ( ! creep.pos.inRangeTo(remotePos, 1)) {
                creep.moveTo(remotePos);
            } else {
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.harvest(creep.pos.findClosestByRange(FIND_SOURCES));
                } else {
                    creep.memory.direction = 'in';
                }
            }
        } else {
            if (creep.carry.energy == 0) {
                creep.memory.direction = 'out';
            } else {
                if (creep.room.owner === undefined || creep.room.owner === myOwner) {
                    if (creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD) == ERR_INVALID_TARGET) {
                        var construction = null;
                        constructions = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 2);
                        if (constructions && constructions.length > 0) {
                            construction = constructions[0];
                            creep.build(construction);
                        } else {
                            constructions = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
                            if (constructions && constructions.length > 0) {
                                creep.moveTo(basePos);
                            } else {
                                var roads = creep.pos.findInRange(FIND_STRUCTURES, 2, {filter: (s) => s.structureType === STRUCTURE_ROAD});
                                if (roads && roads.length > 0) {
                                    road = roads[0];
                                    if ((road.hits+100) < road.hitsMax) {
                                        creep.repair(road);
                                    } else {
                                        creep.moveTo(basePos);
                                    }
                                } else {
                                    creep.moveTo(basePos);
                                }
                            }
                        }
                    } else {
                        creep.moveTo(basePos);
                    }
                } else {
                    creep.moveTo(basePos);
                }
            }
        }
    }
};

module.exports = sroleRoadMaintain;
