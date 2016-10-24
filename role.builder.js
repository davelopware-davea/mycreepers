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
            var repairTargets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < (structure.hitsMax * 0.9)
            });
            if(repairTargets && repairTargets.length) {
                if(creep.repair(repairTargets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repairTargets[0]);
                }
            } else {
                var buildTargets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(buildTargets && buildTargets.length) {
                    if(creep.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(buildTargets[0]);
                    }
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
	    }
	}
};

module.exports = roleBuilder;
