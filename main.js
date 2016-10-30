/*
 ** By Dave Amphlett
 **
 */

var helper = require('helper');

var serviceSpawner = require('service.spawner');
var serviceForeman = require('service.foreman');

var services = {
    'spawner': serviceSpawner,
    'foreman': serviceForeman
}

var roleHarvester = require('role.harvester');
var roleReplenisher = require('role.replenisher');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleSpecial = require('role.special');

var roles = {
    'harvester': roleHarvester,
    'replenisher': roleReplenisher,
    'upgrader': roleUpgrader,
    'builder': roleBuilder,
    'special': roleSpecial
};

var sroleRemoteHarvester = require('srole.remoteharvester');
var sroleRoadMaintain = require('srole.roadmaintain');

var sroles = {
    'roadmaintain': sroleRoadMaintain,
    'remoteharvester': sroleRemoteHarvester
};

var troleRepairer = require('trole.repairer');

var troles = {
    'repairer': troleRepairer
};

module.exports.loop = function () {
    console.log('Loop ===================================================');
    
    for(var serviceName in services) {
        var service = services[serviceName];
        service.run();
    }

    var myStructures = Game.structures;
    for(var idx in myStructures) {
        var struct = myStructures[idx];
        // console.log('tfs:'+struct.pos);
        if (struct.structureType === STRUCTURE_TOWER) {
            var tower = struct;
            troles['repairer'].run(tower);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.type !== 'worker') {
            continue;
        }
        var role = creep.memory.role;
        if (role) {
            roles[role].run(creep);
        }
        var srole = creep.memory.srole;
        if (srole) {
            sroles[srole].run(creep);
        }
    }
}
