/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('helper');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
  log_creeps: function() {
    console.log("Creeps:");
    for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      console.log("  "+name+": role="+creep.memory.role);
    }
  }
};
