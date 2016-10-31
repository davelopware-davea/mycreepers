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
        var workerPreferSpawn = 0;
        var firstReplenisher = null;
        var remoteHarvesterCount = 0;
        var roadMaintainCount = 0;
        var creeps = Game.creeps;
        for (var cn in creeps) {
            var creep = creeps[cn];
            if (creep.memory.type == 'worker') {
                workerCount++;
                if (creep.memory.prefer == STRUCTURE_SPAWN){
                    workerPreferSpawn++;
                }
                if (firstReplenisher==null && creep.memory.role == 'replenisher') {
                    firstReplenisher = creep;
                }
            }
            if (creep.memory.type == 'special') {
                if (creep.memory.srole == 'remoteharvester') {
                    remoteHarvesterCount++;
                } else if (creep.memory.srole == 'roadmaintain') {
                    roadMaintainCount++;
                }
            }
        }
        if (workerCount < serviceForeman.targetCreeperCount()) {
            this.spawnNewWorkerCreep();
        }
        if (workerPreferSpawn < 1 && firstReplenisher) {
            firstReplenisher.memory.prefer = STRUCTURE_SPAWN;
        }
        if (remoteHarvesterCount < 10) {
            this.spawnNewSpecialRemoteHarvesterCreep();
        }
        if (roadMaintainCount < 1) {
            this.spawnNewSpecialRoadMaintainCreep("Base_1", "drinkhere");
        }

    },

    spawnNewWorkerCreep: function() {
        console.log('spawning worker creeper');
        var spawn = Game.spawns['Spawn1'];
        var role = serviceForeman.getSpawnNeededRole();
        var memory = {
            type: 'worker',
            role: role
        };
        var spawnBodyOrder = [
            [MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY],
            [MOVE,MOVE,WORK,WORK,CARRY],
            [MOVE,WORK,CARRY]
        ];
        for (var idx in spawnBodyOrder) {
            var body = spawnBodyOrder[idx];
            console.log('trying to spawn:'+JSON.stringify(body));
            var canCreate = spawn.canCreateCreep(body, undefined, memory);
            if (canCreate === OK) {
                console.log('spawning...');
                spawn.createCreep(body, undefined, memory);
                return;
            } else {
                console.log('can\'t create '+canCreate);
            }
        }
    },

    spawnNewSpecialRemoteHarvesterCreep: function() {
        console.log('spawning special creeper Remote Harvester');
        var spawn = Game.spawns['Spawn1'];
        var srole = 'remoteharvester';
        var memory = {
            'type': 'special',
            'srole': srole
        };
        var sroleRemoteHarvester = require('srole.remoteharvester');
        sroleRemoteHarvester.spawn(spawn, memory);
    },

    spawnNewSpecialRoadMaintainCreep: function(flagBase, flagRemote) {
        console.log('spawning special creeper Road Maintainer');
        var spawn = Game.spawns['Spawn1'];
        var srole = 'roadmaintain';
        var memory = {
            'type': 'special',
            'srole': srole,
            'flagBase': flagBase,
            'flagRemote': flagRemote
        };
        var sroleRoadMaintain = require('srole.roadmaintain');
        sroleRoadMaintain.spawn(spawn, memory);
    }

};

module.exports = serviceSpawner;
