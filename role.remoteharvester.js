var serviceCodex = require('service.codex');

var roleRemoteHarvester = {

    spawn: function(spawner, memory) {
        spawner.createCreep([MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], undefined, memory);
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        var drinkhere = null;
        try {
            drinkhere = Game.flags.drinkhere.pos.findClosestByRange(FIND_SOURCES);
        } catch (ex) {
        }
        if (creep.memory.gather) {
            if (creep.carry.energy < creep.carryCapacity) {
                creep.say('+');
                if (drinkhere === null) {
                    creep.moveTo(Game.flags.drinkhere);
                    return;
                } else if (creep.harvest(drinkhere) == ERR_NOT_IN_RANGE) {
                    creep.say('->+');
                    creep.moveTo(drinkhere.pos);
                }
            } else {
                creep.say('/');
                creep.memory.gather = false;
            }
        } else {
            creep.memory.gather = false;
            if (creep.carry.energy == 0) {
                creep.say('\\');
                creep.memory.gather = true;
            } else {
                var constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (constructionSite) {
                    creep.say('*');
                    if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                        creep.say('->*');
                        creep.moveTo(constructionSite.pos);
                    }
                } else {
                    // var target = Game.flags.Base_1.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_STORAGE)});
                    var target = Game.flags.Base_1.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_CONTROLLER)});
                    creep.say('@');
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.say('->@');
                        creep.moveTo(target.pos);
                    }
                }
            }
        }
    }
};

module.exports = roleRemoteHarvester;
