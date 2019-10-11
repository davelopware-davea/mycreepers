
var helper = require('helper');
var foreman = require('service.foreman');

var sroleRoadMaintain = {

    spawn: function(spawner, memory) {
        spawner.createCreep([MOVE,WORK,CARRY,ATTACK], undefined, memory);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            creep.attack(hostiles[0]);
        }
        if (Game.flags.dismantle !== undefined) {
            var stuffToDismantle = Game.flags.dismantle.pos.lookFor(LOOK_STRUCTURES);
            var thingToDismantle = (stuffToDismantle !== undefined) ? stuffToDismantle[0] : null;
            if (thingToDismantle !== undefined && creep.pos.inRangeTo(thingToDismantle, 100) && thingToDismantle.room == creep.room) {
                creep.say('Rm_bang');
                if (creep.dismantle(thingToDismantle) == ERR_NOT_IN_RANGE) {
                    creep.say('Rm->bang');
                    creep.moveTo(thingToDismantle);
                }
                return;
            }
        }
        var myOwner = Game.flags[creep.memory.flagBase].owner;
        var basePos = Game.flags[creep.memory.flagBase].pos;
        var remotePos = Game.flags[creep.memory.flagRemote].pos;
        if (creep.memory.direction === 'out') {
            creep.say('Rm...')
            if ( ! creep.pos.inRangeTo(remotePos, 1)) {
                creep.say('Rm->...')
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
                    creep.say('Rm&');
                    if (creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD) == ERR_INVALID_TARGET) {
                        var construction = null;
                        constructions = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 2);
                        if (constructions && constructions.length > 0) {
                            construction = constructions[0];
                            creep.say('Rm&');
                            creep.build(construction);
                        } else {
                            creep.say('Rm#');
                            constructions = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
                            if (constructions && constructions.length > 0) {
                                creep.say('~>#');
                                creep.moveTo(basePos);
                            } else {
                                var roads = creep.pos.findInRange(FIND_STRUCTURES, 2, {filter: (s) => s.structureType === STRUCTURE_ROAD});
                                if (roads && roads.length > 0) {
                                    road = roads[0];
                                    if ((road.hits+100) < road.hitsMax) {
                                        creep.say('Rm_r');
                                        creep.repair(road);
                                    } else {
                                        creep.say('Rm->_r');
                                        creep.moveTo(basePos);
                                    }
                                } else {
                                    creep.say('Rm->_r');
                                    creep.moveTo(basePos);
                                }
                            }
                        }
                    } else {
                        creep.say('->r');
                        creep.moveTo(basePos);
                    }
                } else {
                    creep.say('->r');
                    creep.moveTo(basePos);
                }
            }
        }
    }
};

module.exports = sroleRoadMaintain;
