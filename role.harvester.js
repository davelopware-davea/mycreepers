
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
                var source = helper.findClosestRawSource(creep.pos);
                helper.harvestSource(creep, source);
            } else {
                creep.memory.gather = false;
                console.log(creep.name+' switching to replenish storage');
            }
        } else if (creep.carry.energy == 0) {
            creep.memory.gather = true;
            console.log(creep.name+' switching to gather');
        } else {
            var target = helper.findMyClosestEnergyStoreToFill(creep.pos, null, 0);
            if(target) {
                console.log('replenishing store '+target.pos);
                creep.say('*');
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('->*');
                    creep.moveTo(target);
                    console.log(creep.name+' moving to store '+target.pos+' to replenish it');
                }
            } else {
                console.log(creep.name+' no stores to fill?');
            }
        }
    }
};

module.exports = roleHarvester;
