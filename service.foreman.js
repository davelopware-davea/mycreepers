/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('foreman');
 * mod.thing == 'a thing'; // true
 */

var serviceForeman = {
    targetCreeperCount: function() {
        var status = this.getStatus();
        var neededRoles = this.determineNeededRoles(status);
        var total = 0;
        for (var role in neededRoles) {
            total = total + neededRoles[role];
        };
        return total;
    },

    run: function() {
        // console.log('Foreman ------------------------------------------------');
        this.clearUpCreeperMemory();

        var status = this.getStatus();
        var creeps = Game.creeps;

        var defaultRole = this.getDefaultRole(status);
        var neededRoles = this.determineNeededRoles(status);

        for (var name in creeps) {
            var creep = creeps[name];

            var neededRole = defaultRole;
            for (var role in neededRoles) {
                if (neededRoles[role] > 0) {
                    neededRole = role;
                    neededRoles[role] = neededRoles[role] - 1;
                    break;
                }
            }

            if (creep.memory.role != neededRole) {
                console.log('Turning '+creep.name+' from '+creep.memory.role+' to '+neededRole);
                creep.memory.role = neededRole;
                creep.say('=' + defaultRole);
            }
        }

    },

    getDefaultRole: function(status) {
        if (status.spawnerNeeds > 0) {
            return 'harvester';
        }

        return 'upgrader';
    },
    
    determineNeededRoles: function(status) {
        var needs = {};
        
        if (status.spawnerNeeds > 0) {
            needs = {
                'harvester': 3,
                'builder': 1
            };
        } else {
            needs = {
                'upgrader': 3,
                'builder': 1
            };
        }
        
        return needs;
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
