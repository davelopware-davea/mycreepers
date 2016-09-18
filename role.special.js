var serviceCodex = require('service.codex');

var roleSpecial = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.mission == undefined || creep.memory.mission == 'discover') {
            creep.memory.mission = 'discover';
            this.discover(creep);
        }

        if (creep.memory.mission == 'research-prep') {
            creep.say('->spawn');
            var target = Game.spawns['Spawn1'];
            if (creep.pos.inRangeTo(target,1)) {
                creep.memory.mission = 'research';
            } else {
                creep.moveTo(target);
            }
        }

        if (creep.memory.mission == 'research') {
            creep.say('?>source');
            var target = Game.getObjectById(creep.memory.target);
            if (creep.pos.inRangeTo(target,1)) {
                serviceCodex.setDiscoveryStatus(target.id, 'found');
                creep.memory.mission = 'discover';
            } else {
                creep.moveTo(target);
            }
        }

	},

	discover: function(creep) {
	    if (Memory.discoveries === undefined) {
	        Memory.discoveries = {};
	    }

        var sources = creep.room.find(FIND_SOURCES);
        for (var sourceName in sources) {
            var source = sources[sourceName];
            if (serviceCodex.notDiscovered(source.id)) {
                creep.memory.target = source.id;
                creep.memory.mission = 'research-prep';
                serviceCodex.setDiscoveryStatus(source.id, 'attempting');
            }
        }
        if (Object.keys(sources).length > 2) {
            var source = sources[1];
            creep.say('?' + source.name);
            creep.moveTo(source);
        }
	}
};

module.exports = roleSpecial;
