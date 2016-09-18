/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('foreman');
 * mod.thing == 'a thing'; // true
 */

var serviceForeman = {
    targetCreeperCount: 4,
    specialOpsMax: 0,

    run: function() {
        // console.log('Foreman ------------------------------------------------');
        this.clearUpCreeperMemory();

        var status = this.getStatus();
        var creeps = Game.creeps;

        var defaultRole = this.getDefaultRole(status);

        var specialOpsNeeded = status.creeperCount - (this.targetCreeperCount-this.specialOpsMax);

        var specialOpsExisting = 0;
        for (var name in creeps) {
            var creep = creeps[name];

            var neededRole = defaultRole;

            if (specialOpsExisting < specialOpsNeeded) {
                neededRole = 'special';
            }

            if (creep.memory.role != neededRole) {
                creep.memory.role = neededRole;
                creep.say('=' + defaultRole);
            }

            if (creep.memory.role == 'special') {
                specialOpsExisting++;
            }
        }

    },

    getDefaultRole: function(status) {
        if (status.spawnerNeeds > 0) {
            return 'harvester';
        }

        return 'upgrader';
    },

    getStatus: function() {
        var status = {};

        var spawner = Game.spawns['Spawn1'];
        status.spawnerNeeds = spawner.energyCapacity - spawner.energy;

        status.creeperCount = Object.keys(Game.creeps).length;

        return status;
    },

    clearUpCreeperMemory: function() {
      for(var name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
          Memory.creeps[name] = undefined;
        }

      }
    }

};

module.exports = serviceForeman;
