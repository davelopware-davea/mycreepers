
var helper = require('helper');
var serviceCodex = require('service.codex');

var roleRemoteHarvester = {

    spawn: function(spawner, memory) {
        // spawner.createCreep([MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], undefined, memory);
        spawner.createCreep([MOVE,WORK,CARRY,CARRY,CARRY], undefined, memory);
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        var drinkhere = null;
        try {
            drinkhere = helper.findClosestRawSource(Game.flags.drinkhere.pos);
        } catch (ex) {
        }
        if (creep.memory.gather) {
            if (creep.carry.energy < creep.carryCapacity) {
                creep.say('+');
                if (drinkhere === null) {
                    creep.moveTo(Game.flags.drinkhere);
                    return;
                } else if (helper.getEnergyFrom(creep, drinkhere) == ERR_NOT_IN_RANGE) {
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
                // var constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                // if (constructionSite) {
                //     creep.say('*');
                //     if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                //         creep.say('->*');
                //         creep.moveTo(constructionSite.pos);
                //     }
                // } else {
                    var target = Game.flags.Base_1.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_STORAGE)});
                    // var target = Game.flags.Base_1.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_CONTROLLER)});
                    creep.say('@');
                    if (helper.putEnergyInto(creep, target) == ERR_NOT_IN_RANGE) {
                        creep.say('->@');
                        creep.moveTo(target.pos);
                    }
                // }
            }
        }
    }
};

module.exports = roleRemoteHarvester;
