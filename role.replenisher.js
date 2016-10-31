
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
                var store = helper.findMyClosestEnergyStoreToUse(creep.pos);
                if (store !== null) {
                    creep.say('loading from store');
                    helper.harvestSource(creep, store);
                } else {
                    creep.say('HELP Store');
                }
            } else {
                creep.memory.gather = false;
                console.log(creep.name+' switching to replenish');
            }
        } else if (creep.carry.energy == 0) {
            creep.memory.gather = true;
            console.log(creep.name+' switching to gather');
        } else {
            var target = null;
            // if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_EXTENSION, 100, 0);
            if (creep.memory.prefer) {
                target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, creep.memory.prefer, 100, null);
                var tname = target ? target.toString() : target;
            }
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_EXTENSION, 100, null);
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_SPAWN, 100, null);
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_TOWER, 10, null);
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_CONTROLLER, 100, null);

            if (target !== null) {
                creep.say('*');
                if(helper.putEnergyInto(creep, target) == ERR_NOT_IN_RANGE) {
                    creep.say('->*');
                    creep.moveTo(target);
                    console.log(creep.name+' moving to '+target.pos+' to replenish it');
                }
            }
        }
    }
};

module.exports = roleHarvester;
