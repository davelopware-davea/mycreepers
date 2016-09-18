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
    targetNumberOfCreeps: serviceForeman.targetCreeperCount,

    run: function() {
        // console.log('Spawner ------------------------------------------------');
        if (Object.keys(Game.creeps).length < this.targetNumberOfCreeps) {
          this.spawnNewCreep();
        }
    },

    spawnNewCreep: function() {
        console.log('spawning creeper');
        var spawn = Game.spawns['Spawn1'];
        spawn.createCreep([MOVE,MOVE,WORK,CARRY]);
    }
};

module.exports = serviceSpawner;
