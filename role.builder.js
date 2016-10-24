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
            var repairTarget = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => (structure.hits * 1.1) < structure.hitsMax
            });
            if (repairTarget) {
                console.log(creep.name+' repair '+repairTarget.pos);
                if(creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repairTarget);
                }
            } else {
                var buildTarget = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                    filter: (structure) => (structure.structureType === STRUCTURE_EXTENSION)
                });
                if (buildTarget === null) {
                    buildTarget = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => (structure.structureType === STRUCTURE_ROAD)
                    });
                }
                if (buildTarget === null) {
                    buildTarget = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                }
                if (buildTarget) {
                    console.log(creep.name+' build '+buildTarget.pos);
                    if(creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(buildTarget);
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
