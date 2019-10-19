
var helper = require('helper');
var serviceCodex = require('service.codex');

var roleRemoteHarvester = {

    spawn: function(spawner, memory) {
        //spawner.createCreep([MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], undefined, memory);
        spawner.createCreep([MOVE,WORK,CARRY,CARRY,CARRY,CARRY], undefined, memory);
        //spawner.createCreep([MOVE,WORK,CARRY,CARRY,CARRY], undefined, memory);
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        var basePos = Game.flags[creep.memory.flagBase].pos;
        var remotePos = Game.flags[creep.memory.flagRemote].pos;
        var drinkhere = null;
        try {
            drinkhere = helper.findClosestRawSource(remotePos);
        } catch (ex) {
        }
        if (creep.memory.gather) {
            if (creep.carry.energy < creep.carryCapacity) {
                creep.say('Rh+');
                if (drinkhere === null) {
                    creep.moveTo(drinkhere);
                    return;
                } else if (helper.getEnergyFrom(creep, drinkhere, this) == ERR_NOT_IN_RANGE) {
                    creep.say('Rh->+');
                    creep.moveTo(drinkhere);
                }
            } else {
                creep.say('Rh/');
                creep.memory.gather = false;
            }
        } else {
            creep.memory.gather = false;
            if (creep.carry.energy == 0) {
                creep.say('Rh\\');
                creep.memory.gather = true;
            } else {
                var target = basePos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_STORAGE)});
                // var target = basePos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_CONTROLLER)});
                creep.say('Rh@');
                if (helper.putEnergyInto(creep, target, this) == ERR_NOT_IN_RANGE) {
                    creep.say('Rh->@');
                    creep.moveTo(target.pos);
                }
            }
        }
    },

    log: function(msg) {
        if (this.config['log']) {
            console.log('SRolRHar:'+msg);
        }
    }

};

module.exports = roleRemoteHarvester;
