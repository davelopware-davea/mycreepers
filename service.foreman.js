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
// console.log(JSON.stringify(neededRoles));
        var neededReplenishers = this.determineNeededReplenishers(status);
console.log(JSON.stringify(neededReplenishers));

        for (var name in creeps) {
            var creep = creeps[name];
            if (creep.memory.type != 'worker') {
                continue;
            }

            var neededRole = defaultRole;
            var neededPrefer = STRUCTURE_TOWER;
            for (var role in neededRoles) {
                if (neededRoles[role] > 0) {
                    neededRole = role;
                    neededRoles[role] = neededRoles[role] - 1;

                    if (neededRole == 'replenisher') {
                        for (var prefer in neededReplenishers) {
                            if (neededReplenishers[prefer] > 0) {
                                neededPrefer = prefer;
                                neededReplenishers[prefer] = neededReplenishers[prefer] - 1;
                                break;
                            }
                        }
                    }

                    break;
                }
            }

            if (creep.memory.role != neededRole) {
                console.log('Turning '+creep.name+' from '+creep.memory.role+' to '+neededRole);
                creep.memory.role = neededRole;
                creep.say('=' + neededRole);
            }
            if (role == 'replenisher') {
                creep.memory.prefer = neededPrefer;
                // creep.memory.prefer = STRUCTURE_TOWER;
            }
        }
    },

    getDefaultRole: function(status) {
        if (status.spawnerNeeds > 0) {
            return 'harvester';
        }

        return 'upgrader';
    },

    getSpawnNeededRole: function() {
        var status = this.getStatus();
        var creeps = Game.creeps;

        var defaultRole = this.getDefaultRole(status);
        var neededRoles = this.determineNeededRoles(status);

        for (var name in creeps) {
            var creep = creeps[name];
            var role = creep.memory.role;
            if (neededRoles[role] && neededRoles[role] > 0) {
                neededRoles[role] = neededRoles[role] - 1;
            }
        }
        for (var role in neededRoles) {
            if (neededRoles[role] > 0) {
                return role;
            }
        }

        return 'harvester';
    },

    determineNeededRoles: function(status) {
        var needs = {};

        if (status.energyNeeded > 0) {
            needs = {
                'harvester': 4,
                'replenisher': 3,
                'builder': 1,
                'upgrader': 2
            };
        } else if (status.buildingNeeded) {
            needs = {
                'harvester': 4,
                'replenisher': 3,
                'builder': 2,
                'upgrader': 1
            };
        } else {
            needs = {
                'harvester': 4,
                'replenisher': 3,
                'builder': 1,
                'upgrader': 2
            };
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
