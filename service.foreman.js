/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('foreman');
 * mod.thing == 'a thing'; // true
 */

var helper = require('helper');

var serviceForeman = {
    setConfig: function(config) {
        this.config = config;
        this.spawnNeededRole = undefined;
    },
    
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
        console.log(JSON.stringify(neededRoles));

        // group the creeps by role
        var creepsByRole = {};
        for (var name in creeps) {
            var creep = creeps[name];
            if (creep.memory.type == 'worker') {
                var role = creep.memory.role;
    
                if ( ! (role in creepsByRole)) {
                    creepsByRole[role] = [];
                }
                creepsByRole[role].push(creep);
            }
        }
        console.log("creepsByRole>"+JSON.stringify(creepsByRole));

        // first figure out what existing creeps we don't need
        var creepsNotNeeded = [];
        for (var role in creepsByRole) {

            if (role in neededRoles) {
                while (creepsByRole[role].length > neededRoles[role]) {
                    creepsNotNeeded.push(creepsByRole[role].pop());
                }
            } else {
                while (creepsByRole[role].length > 0) {
                    creepsNotNeeded.push(creepsByRole[role].pop());
                }
                delete creepsByRole[role];
            }
        }
        console.log("creepsByRole>"+JSON.stringify(creepsByRole));
        console.log("creepsNotNeeded>"+JSON.stringify(creepsNotNeeded));
        
        // now figure out what creeps we're missing
        for (var role in neededRoles) {
// console.log("Aa");

            if (role in creepsByRole) {
// console.log("Ab " + creepsByRole[role].length + " vs " + neededRoles[role]);
                while (creepsByRole[role].length < neededRoles[role]) {
// console.log("Ac "+creepsByRole[role].length);
                    // we dont have enough - make one
                    if (creepsNotNeeded.length > 0) {
// console.log("B");
                        var unlovedCreep = creepsNotNeeded.pop();
                        console.log('Turning '+unlovedCreep.name+' from '+unlovedCreep.memory.role+' to '+role);
                        unlovedCreep.memory.role = role;
                        unlovedCreep.say('=>' + role);
                        creepsByRole[role].push(unlovedCreep);
                    } else {
// console.log("C "+this.spawnNeededRole);
                        console.log('Could do with a new ('+role+')')
                        if (this.spawnNeededRole === undefined) {
// console.log("D");
                            this.spawnNeededRole = role;
                            console.log('First time so set spawnNeededRole ('+role+')')
                        }
                        break;
                    }
// console.log("E");
                }
// console.log("F");
            } else if (neededRoles[role] > 0) {
// console.log("G");
                console.log('Could do with a new ('+role+')')
                if (this.spawnNeededRole === undefined) {
// console.log("H");
                    this.spawnNeededRole = role;
                    console.log('First time so set spawnNeededRole ('+role+')')
                }
// console.log("I");
                break;
            }
// console.log("J");
        }
// console.log("K");
        
//         _.forEach(creepsNotNeeded, function(creep) {
// // console.log("L");
//             console.log('Time to kill off '+creep.name);
//             creep.suicide();
//         });
    },

    getDefaultRole: function(status) {
        if (status.spawnerNeeds > 0) {
            return 'harvester';
        }

        return 'upgrader';
    },

    getSpawnNeededRole: function() {
        if (this.spawnNeededRole !== undefined) {
            return this.spawnNeededRole;
        } else {
            return 'upgrader';
        }
        // var status = this.getStatus();
        // var creeps = Game.creeps;

        // var defaultRole = this.getDefaultRole(status);
        // var neededRoles = this.determineNeededRoles(status);

        // for (var name in creeps) {
        //     var creep = creeps[name];
        //     var role = creep.memory.role;
        //     if (neededRoles[role] && neededRoles[role] > 0) {
        //         neededRoles[role] = neededRoles[role] - 1;
        //     }
        // }
        // for (var role in neededRoles) {
        //     if (neededRoles[role] > 0) {
        //         return role;
        //     }
        // }

        // return 'harvester';
    },

    determineNeededRoles: function(status) {
        var needs = {};

        if (status.energyNeeded > 0) {
            needs = this.config['energyNeeded'];
        } else if (status.buildingNeeded) {
            needs = this.config['buildingNeeded'];
        } else {
            needs = this.config['deault'];
        }
        return needs;
    },

    determineNeededReplenishers: function(status) {
        var needs = {};

        needs = {};
        needs[STRUCTURE_EXTENSION] = 1;
        needs[STRUCTURE_TOWER] = 1;
        needs[STRUCTURE_SPAWN] = 1;
        return needs;
    },

    getStatus: function() {
        var status = {};

        var spawner = Game.spawns['Spawn1'];
        var energyNeeders = spawner.room.find(FIND_MY_STRUCTURES, {
            filter: function(structure) {
                return
                (
                    (
                        structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER
                    )
                    && structure.energy < structure.energyCapacity
                );
            }
        });
        var baseStorage = spawner.pos.findClosestByRange(FIND_MY_STRUCTURES, function(s) {
            return s.structureType === STRUCTURE_STORAGE;
        });

        status.energyNeeded = baseStorage.energy < 200;
        //status.energyNeeded = (energyNeeders !== null && energyNeeders.length > 0); //spawner.energyCapacity - spawner.energy;

        var nextToRepair = this.nextThingToRepair(spawner.pos, true);
        var nextToBuild = this.nextThingToBuild(spawner.pos);
        status.buildingNeeded = (nextToRepair !== null || nextToBuild !== null);

        status.creeperCount = Object.keys(Game.creeps).length;

        return status;
    },

    nextThingToRecharge: function(pos, essentialOnly) {
        if (essentialOnly === undefined) {
            essentialOnly = false;
        }
        var target = null;

        var targetsEssential = [
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_SPAWN, 100); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_TOWER, 100); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 2); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_EXTENSION, 100); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_CONTROLLER, 100); }
        ];
        _.forEach(targetsEssential, function(finderFn) {
            target = finderFn();
            if (target) {
                return false; // stop looping
            }
        });
        if (target || essentialOnly) {
            return target;
        }

        var targetsAdditional = [
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 5); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_ROAD, 5000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 5000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 10000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 20000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 40000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 50000); },
        ];

        _.forEach(targetsAdditional, function(finderFn) {
            target = finderFn();
            if (target) {
                return false; // stop looping
            }
        });
        if (target) {
            return target;
        }
    },

    nextThingToRepair: function(pos, essentialOnly) {
        if (essentialOnly === undefined) {
            essentialOnly = false;
        }
        var target = null;

        var targetsEssential = [
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_SPAWN, 100); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_TOWER, 100); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 2); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_EXTENSION, 100); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_CONTROLLER, 100); }
        ];
        _.forEach(targetsEssential, function(finderFn) {
            target = finderFn();
            if (target) {
                return false; // stop looping
            }
        });
        if (target || essentialOnly) {
            return target;
        }

        var targetsAdditional = [
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 5); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_ROAD, 5000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 5000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 10000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 20000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 40000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_WALL, 50000); },
        ];

        _.forEach(targetsAdditional, function(finderFn) {
            target = finderFn();
            if (target) {
                return false; // stop looping
            }
        });
        if (target) {
            return target;
        }
    },

    nextThingToBuild: function(pos, essentialOnly) {
        if (essentialOnly === undefined) {
            essentialOnly = false;
        }
        var target = null;

        var targetsEssential = [
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_TOWER); },
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_RAMPART); },
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_WALL); },
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_CONTAINER); },
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_ROAD); },
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_STORAGE); }
        ];
        _.forEach(targetsEssential, function(finderFn) {
            target = finderFn();
            if (target) {
                return false; // stop looping
            }
        });
        if (target || essentialOnly) {
            return target;
        }

        var targetsAdditional = [
            function() { return helper.findMyClosestConstructable(pos, STRUCTURE_STORAGE); },
            function() { return helper.findMyClosestConstructable(pos); }
        ];
        _.forEach(targetsAdditional, function(finderFn) {
            target = finderFn();
            if (target) {
                return false; // stop looping
            }
        });
        if (target || essentialOnly) {
            return target;
        }

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
