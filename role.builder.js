
var helper = require('helper');
var foreman = require('service.foreman');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
            var repairTarget = null;
            repairTarget = foreman.nextThingToRepair(creep.pos, true);
            if (repairTarget) {
                console.log(creep.name+' repair '+repairTarget.pos);
                if(creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repairTarget);
                }
                return;
            }
            var buildTarget = null;
            buildTarget = foreman.nextThingToBuild(creep.pos, true);
            if (buildTarget) {
                console.log(creep.name+' build '+buildTarget.pos);
                if(creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildTarget);
                }
                return;
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            helper.harvestSource(creep, sources[0]);
	    }
	}
};

module.exports = roleBuilder;
