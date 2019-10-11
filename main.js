/*
 ** By Dave Amphlett
 **
 */

var atlas = require("atlas");

atlas.init({
    'services': {
        'service.foreman': require('service.foreman'),
        'service.spawner': require('service.spawner')
    },
    'roles': {
        'role.harvester': require('role.harvester'),
        'role.replenisher': require('role.replenisher'),
        'role.upgrader': require('role.upgrader'),
        'role.builder': require('role.builder'),
        // 'role.special': require('role.special')
    },
    'config': {
        'atlas': {
            'pause': true,
        },
        'service.foreman': {
            'default': {
                'harvester': 0,
                'replenisher': 2,
                'builder': 3,
                'upgrader': 2
            },
            'energyNeeded': {
                'harvester': 0,
                'replenisher': 2,
                'builder': 3,
                'upgrader': 2
            },
            'buildingNeeded': {
                'harvester': 0,
                'replenisher': 2,
                'builder': 3,
                'upgrader': 2
            }
        }
    }
});


// var helper = require('helper');

// var serviceSpawner = require('service.spawner');
// var serviceForeman = require('service.foreman');

// var services = {
//     'foreman': serviceForeman,
//     'spawner': serviceSpawner
// }

// serviceForeman.setConfig({
//     'energyNeeded': {
//         'harvester': 0,
//         'replenisher': 2,
//         'builder': 3,
//         'upgrader': 2
//     },
//     'buildingNeeded': {
//         'harvester': 0,
//         'replenisher': 2,
//         'builder': 3,
//         'upgrader': 2
//     },
//     'default': {
//         'harvester': 0,
//         'replenisher': 2,
//         'builder': 3,
//         'upgrader': 2
//     }
// });
// serviceSpawner.setForeman(serviceForeman);

// var roleHarvester = require('role.harvester');
// var roleReplenisher = require('role.replenisher');
// var roleUpgrader = require('role.upgrader');
// var roleBuilder = require('role.builder');
// // var roleSpecial = require('role.special');

// var roles = {
//     'harvester': roleHarvester,
//     'replenisher': roleReplenisher,
//     'upgrader': roleUpgrader,
//     'builder': roleBuilder,
//     // 'special': roleSpecial
// };

// var sroleDefender = require('srole.defender');
// var sroleRemoteHarvester = require('srole.remoteharvester');
// var sroleRoadMaintain = require('srole.roadmaintain');
// var sroleWanderer = require('srole.wanderer');

// var sroles = {
//     // 'defender': sroleDefender,
//     // 'roadmaintain': sroleRoadMaintain,
//     // 'remoteharvester': sroleRemoteHarvester,
//     // 'wanderer': sroleWanderer
// };

// var troleRepairer = require('trole.repairer');

// var troles = {
//     // 'repairer': troleRepairer
// };

module.exports.loop = function () {
    atlas.loop();
    // console.log('Loop ===================================================');
    // // return;

    // for(var serviceName in services) {
    //     var service = services[serviceName];
    //     service.run();
    // }

    // // var myStructures = Game.structures;
    // // for(var idx in myStructures) {
    // //     var struct = myStructures[idx];
    // //     // console.log('tfs:'+struct.pos);
    // //     if (struct.structureType === STRUCTURE_TOWER) {
    // //         var tower = struct;
    // //         troles['repairer'].run(tower);
    // //     }
    // // }

    // for(var name in Game.creeps) {
    //     var creep = Game.creeps[name];
    //     if (creep.memory.type !== 'worker' && creep.memory.type !== 'special') {
    //         continue;
    //     }
    //     var role = creep.memory.role;
    //     if (role && roles[role]) {
    //         roles[role].run(creep);
    //     }
    //     // var srole = creep.memory.srole;
    //     // if (srole && sroles[srole]) {
    //     //     sroles[srole].run(creep);
    //     // }
    // }
    
    // // helper.hack_reroute();
    
}
