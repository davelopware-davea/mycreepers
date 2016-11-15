
var helper = require('helper');
var foreman = require('service.foreman');

var sroleWonderer = {

    spawn: function(spawner, memory) {
        console.log('****spawning');
        // var result = spawner.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,WORK,CLAIM,CLAIM], undefined, memory);
        var result = spawner.createCreep([MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK], undefined, memory);
        console.log('    '+JSON.stringify(result));
        return result;
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if (Game.flags.wonder !== undefined) {
            if (creep.memory.action !== undefined) {
                if (creep.memory.action == 'claim') {
                    creep.say('w_claim');
                    creep.claimController(creep.room.controller);
                } else if (creep.memory.action == 'harvest') {
                    creep.say('w_h');
                    var source = Game.flags.wonder.pos.findClosestByPath(FIND_SOURCES);
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        creep.say('w->h');
                        creep.moveTo(source);
                    }
                } else if (creep.memory.action == 'build') {
                    creep.say('w_b');
                    var site = Game.flags.wonder.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                    if (creep.build(site) === ERR_NOT_IN_RANGE) {
                        creep.say('w->b');
                        creep.moveTo(site);
                    }
                } else if (creep.memory.action == 'harvest-build') {
                    if (creep.memory.subaction !== 'build') {
                        if (creep.carry.energy < creep.carryCapacity) {
                            creep.say('w_Hb');
                            var source = Game.flags.wonder.pos.findClosestByPath(FIND_SOURCES);
                            if (creep.memory.source !== undefined) {
                                source = Game.flags[creep.memory.source].pos.findClosestByPath(FIND_SOURCES);
                            }
                            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                                creep.say('w->Hb');
                                creep.moveTo(source);
                            }
                        } else {
                            creep.memory.subaction = 'build';
                        }
                    } else {
                        if (creep.carry.energy > 0) {
                            creep.say('w_hB');
                            var site = Game.flags.wonder.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                            if (creep.build(site) === ERR_NOT_IN_RANGE) {
                                creep.say('w->hB');
                                creep.moveTo(site);
                            }
                        } else {
                            creep.memory.subaction = 'harvest';
                        }
                    }
                } else if (creep.memory.action == 'upgrade') {
                    creep.say('w_b');
                    var controller = creep.room.controller;
                    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                        creep.say('w->c');
                        creep.moveTo(controller);
                    }
                    creep.claimController(creep.room.controller);
                }
            } else {
                creep.say('w->');
                creep.moveTo(Game.flags.wonder);
            }
        }
    }
};

module.exports = sroleWonderer;
