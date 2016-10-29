/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawner');
 * mod.thing == 'a thing'; // true
 */

var serviceForeman = require('service.foreman');

var serviceSpawner = {
    run: function() {
        // console.log('Spawner ------------------------------------------------');

        var workerCount = 0;
        var remoteHarvesterCount = 0;
        var creeps = Game.creeps;
        for (var cn in creeps) {
            var creep = creeps[cn];
            if (creep.memory.type == 'worker') {
                workerCount++;
            }
            if (creep.memory.type == 'special' && creep.memory.role == 'remoteharvester') {
                remoteHarvesterCount++;
            }
        }
        if (workerCount < serviceForeman.targetCreeperCount()) {
            this.spawnNewWorkerCreep();
        }
        if (remoteHarvesterCount < 2) {
            this.spawnNewSpecialCreep('remoteharvester');
        }

    },

    spawnNewWorkerCreep: function() {
        console.log('spawning worker creeper');
        var spawn = Game.spawns['Spawn1'];
        var role = serviceForeman.getSpawnNeededRole();
        var memory = {
            'type': 'worker',
            'role': role
        };
        var spawnBodyOrder = [
            [MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
            [MOVE,WORK,WORK,CARRY,CARRY],
            [MOVE,WORK,CARRY]
        ];
        for (var idx in spawnBodyOrder) {
            var body = spawnBodyOrder[idx];
            if (spawn.canCreateCreep(body, undefined, memory)) {
                spawn.createCreep(body, undefined, memory);
                return;
            }
        }
    },

    spawnNewSpecialCreep: function() {
        console.log('spawning special creeper');
        var spawn = Game.spawns['Spawn1'];
        var role = 'remoteharvester';
        var memory = {
            'type': 'special',
            'role': role
        };
        var roleRemoteHarvester = require('role.remoteharvester');
        roleRemoteHarvester.spawn(spawn, memory);
    }

};

module.exports = serviceSpawner;
