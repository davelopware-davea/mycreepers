
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
                creep.say('loading from store');
                helper.harvestSource(creep, store);
            } else {
                creep.memory.gather = false;
                console.log(creep.name+' switching to replenish');
            }
        } else if (creep.carry.energy == 0) {
            creep.memory.gather = true;
            console.log(creep.name+' switching to gather');
        } else {
            var target = null;
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_SPAWN);
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_TOWER);
            if (target === null) target = helper.findMyClosestRechargeable(Game.flags.Base_1.pos, STRUCTURE_CONTROLLER);

            if (target !== null) {
                creep.say('replenishing structure');
                if(helper.putEnergyInto(creep, target) == ERR_NOT_IN_RANGE) {
                    creep.say('->struct');
                    creep.moveTo(target);
                    console.log(creep.name+' moving to '+target.pos+' to replenish it');
                }
            }
        }
    }
};

module.exports = roleHarvester;
