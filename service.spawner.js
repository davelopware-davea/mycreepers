/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawner');
 * mod.thing == 'a thing'; // true
 */

var serviceSpawner = {
    
    setForeman: function(foreman) {
        this.foreman = foreman;
    },
    
    run: function() {
        // console.log('Spawner ------------------------------------------------');
        // var sroleWanderer = require('srole.wanderer');
        // var spawn = Game.spawns['Spawn1'];
        // var memory = {'type':'special','srole':'wanderer'};
        // sroleWanderer.spawn(spawn, memory);
        // return;

        var spawn = Game.spawns['Spawn1'];
        if (spawn.energy == spawn.energyCapacity) {
            var neededSpawnRole = this.foreman.getSpawnNeededRole();
            if (neededSpawnRole !== undefined) {
                this.spawnNewWorkerCreep(neededSpawnRole);
            }
        }
        
        return;

        // var workerCount = 0;
        // var workerPreferSpawn = 0;
        // var firstReplenisher = null;
        // var remoteHarvesterCount = 0;
        // var roadMaintainCount = 0;
        // var remoteHarvestRemotes = [];
        // var remoteMaintainRemotes = [];
        // var remoteDefenders = [];
        // var creeps = Game.creeps;
        // for (var cn in creeps) {
        //     var creep = creeps[cn];
        //     if (creep.memory.type == 'worker') {
        //         workerCount++;
        //         if (creep.memory.prefer == STRUCTURE_SPAWN){
        //             workerPreferSpawn++;
        //         }
        //         if (firstReplenisher==null && creep.memory.role == 'replenisher') {
        //             firstReplenisher = creep;
        //         }
        //     }
        //     if (creep.memory.type == 'special') {
        //         if (creep.memory.srole == 'remoteharvester') {
        //             remoteHarvesterCount++;
        //             var remote = creep.memory.flagRemote;
        //             remoteHarvestRemotes[remote] = remoteHarvestRemotes[remote] !== undefined ? remoteHarvestRemotes[remote] + 1 : 1;
        //         } else if (creep.memory.srole == 'roadmaintain') {
        //             roadMaintainCount++;
        //             var remote = creep.memory.flagRemote;
        //             remoteMaintainRemotes[remote] = remoteMaintainRemotes[remote] !== undefined ? remoteMaintainRemotes[remote] + 1 : 1;
        //         } else if (creep.memory.srole == 'defender') {
        //             var remote = creep.memory.flagRemote;
        //             remoteDefenders[remote] = remoteDefenders[remote] !== undefined ? remoteDefenders[remote] + 1 : 1;
        //         }
        //     }
        // }
        // if (workerCount < this.foreman.targetCreeperCount()) {
        //     this.spawnNewWorkerCreep();
        // }
        // if (workerPreferSpawn < 1 && firstReplenisher) {
        //     firstReplenisher.memory.prefer = STRUCTURE_SPAWN;
        // }
        
        // var spawner = this;

        // var remoteDefendTargets = {
        //     'remote_1':0,
        //     'remote_2':0,
        //     'remote_3':6
        // };
        // console.log('#################'+JSON.stringify(remoteDefendTargets));
        // _.forEach(remoteDefendTargets, function(target, remote) {
        //     console.log(JSON.stringify({t:target,r:remote}));
        //     if (remoteDefenders[remote] == undefined || remoteDefenders[remote] < target) {
        //         console.log(JSON.stringify({t:'spawning',r:remote}));
        //         spawner.spawnNewSpecialDefenderCreep(remote);
        //     }
        // });


        // var remoteHarvestTargets = {
        //     'remote_1':3,
        //     'remote_2':3,
        //     'remote_3':3
        // };
        // _.forEach(remoteHarvestTargets, function(target, remote) {
        //     console.log(JSON.stringify({t:target,r:remote}));
        //     if (remoteHarvestRemotes[remote] == undefined || remoteHarvestRemotes[remote] < target) {
        //         console.log(JSON.stringify({t:'spawning',r:remote}));
        //         spawner.spawnNewSpecialRemoteHarvesterCreep("Base_1", remote);
        //     }
        // });
        // var remoteMaintainTargets = {
        //     'remote_1':1,
        //     'remote_2':1,
        //     'remote_3':1
        // };
        // _.forEach(remoteMaintainTargets, function(target, remote) {
        //     if (remoteMaintainRemotes[remote] == undefined || remoteMaintainRemotes[remote] < target) {
        //         spawner.spawnNewSpecialRoadMaintainCreep("Base_1", remote);
        //     }
        // });
        // _.forEach(remoteMaintainTargets, function(target, remote) {
        //     if (remoteMaintainRemotes[remote] == undefined || remoteMaintainRemotes[remote] < target) {
        //         spawner.spawnNewSpecialRoadMaintainCreep("Base_1", remote);
        //     }
        // });
    },

    spawnNewWorkerCreep: function(role) {
        console.log('spawning worker creeper ('+role+')');
        var spawn = Game.spawns['Spawn1'];
        // var role = this.foreman.getSpawnNeededRole();
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

    spawnNewSpecialRemoteHarvesterCreep: function(flagBase, flagRemote) {
        console.log('spawning special creeper Remote Harvester');
        var spawn = Game.spawns['Spawn1'];
        var srole = 'remoteharvester';
        var memory = {
            'type': 'special',
            'srole': srole,
            'flagBase': flagBase,
            'flagRemote': flagRemote
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
    },

    spawnNewSpecialDefenderCreep: function(flagRemote) {
        console.log('spawning special creeper Defender');
        var spawn = Game.spawns['Spawn1'];
        var srole = 'defender';
        var memory = {
            'type': 'special',
            'srole': srole,
            'flagRemote': flagRemote
        };
        var sroleDefender = require('srole.defender');
        sroleDefender.spawn(spawn, memory);
    }

};

module.exports = serviceSpawner;
