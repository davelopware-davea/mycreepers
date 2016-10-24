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
        if (Object.keys(Game.creeps).length < serviceForeman.targetCreeperCount()) {
          this.spawnNewCreep();
        }
    },

    spawnNewCreep: function() {
        console.log('spawning creeper');
        var spawn = Game.spawns['Spawn1'];
        var role = serviceForeman.getSpawnedNeededRole();
        var memory = {
            'role': role
        };
        spawn.createCreep([MOVE,MOVE,WORK,CARRY], memory);
    }
};

module.exports = serviceSpawner;
