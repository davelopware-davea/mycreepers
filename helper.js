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
            var type = creep.memory.type ? 'type='+creep.memory.type : 'type=unknown';
            var role = creep.memory.role ? 'role='+creep.memory.role : 'srole='+creep.memory.srole;
            console.log(' '+name+': '+type+' '+role);
        }
    },
    log_structs: function(structs) {
        console.log("Structures:");
        for (var sidx in structs) {
            var structure = structs[sidx];
            console.log("  "+structure.id+": type="+structure.structureType);
        }
    },

    harvestSource: function(creep, source) {
        console.log(creep.name+' harvesting '+source.toString()+' '+source.pos);
        creep.say('+');
        if (this.getEnergyFrom(creep, source) == ERR_NOT_IN_RANGE) {
            // check if we're in a holding pattern
            if (creep.memory.source_holding_pattern && creep.memory.source_holding_pattern > 0) {
                var holdingFlag = Game.flags['SourceHoldingPattern'];
                creep.moveTo(holdingFlag);
                creep.memory.source_holding_pattern = creep.memory.source_holding_pattern - 1;
                creep.memory.source_waiting_for = 0;
                creep.say('->X_'+creep.memory.source_holding_pattern);
                console.log(creep.name+' holding now for '+creep.memory.source_holding_pattern);

            } else {
                // check if we're blocking the source
                creep.memory.source_holding_pattern = undefined;
                if (creep.pos.getRangeTo(source) < 4) {
                    if (creep.memory.source_waiting_for) {
                        creep.memory.source_waiting_for = creep.memory.source_waiting_for + 1;
                    } else {
                        creep.memory.source_waiting_for = 1;
                    }
                    creep.say('->+|'+creep.memory.source_waiting_for);
                    console.log(creep.name+' source blocked now for '+creep.memory.source_waiting_for);
                }
                if (creep.memory.source_waiting_for > 10) {
                    creep.memory.source_waiting_for = 0;
                    creep.memory.source_holding_pattern = 5;
                    console.log(creep.name+' entering the holding pattern');
                } else {
                    creep.say('->+');
                    creep.moveTo(source);
                }
            }
        } else {
            creep.memory.source_waiting_for = undefined;
            creep.memory.source_holding_pattern = undefined;
        }
    },
    getEnergyFrom: function(creep, struct) {
        console.log(creep.name+' getting energy from '+struct.toString()+' '+struct.pos);
        if (struct instanceof Source) {
            return creep.harvest(struct);
        }
        if (struct.structureType === STRUCTURE_STORAGE ||
            struct.structureType === STRUCTURE_CONTAINER ||
            struct.structureType === STRUCTURE_EXTENSION
        ) {
            return creep.withdraw(struct, RESOURCE_ENERGY);
        }
    },
    putEnergyInto: function(creep, target) {
        console.log(creep.name+' putting energy into '+target.toString()+' '+target.pos);
        if (target.structureType === STRUCTURE_CONTROLLER) {
            return creep.upgradeController(target);
        }
        if (target.structureType === STRUCTURE_STORAGE ||
            target.structureType === STRUCTURE_CONTAINER ||
            target.structureType === STRUCTURE_SPAWN ||
            target.structureType === STRUCTURE_TOWER
        ) {
            return creep.transfer(target, RESOURCE_ENERGY);
        }
    },
    structureTypeAndEnergyBetween: function(struct, structType, energyPercentageBelow, energyPercentageAbove) {
        if (struct.structureType !== structType) {
            return false;
        }
        // if (energyPercentageAbove === 0) {
        //     energyPercentageAbove = 0.000001;
        // }
        if (
            struct.structureType === STRUCTURE_EXTENSION ||
            struct.structureType === STRUCTURE_TOWER ||
            struct.structureType === STRUCTURE_SPAWN
        ) {
            if (energyPercentageBelow !== null &&
                ((struct.energy * 100 / struct.energyCapacity) >= energyPercentageBelow)
            ) {
                return false;
            } else if (energyPercentageAbove !== null &&
                ((struct.energy * 100 / struct.energyCapacity) <= energyPercentageAbove)
            ) {
                return false;
            }
            return true;
        }
        if (
            struct.structureType === STRUCTURE_STORAGE ||
            struct.structureType === STRUCTURE_CONTAINER
        ) {
            if (energyPercentageBelow !== null &&
                ((struct.store * 100 / struct.storeCapacity) >= energyPercentageBelow)
            ) {
                return false;
            } else if (energyPercentageAbove !== null &&
                ((struct.store * 100 / struct.storeCapacity) <= energyPercentageAbove)
            ) {
                return false;
            }
            return true;
        }
        if (
            struct.structureType === STRUCTURE_CONTROLLER
        ) {
            if (energyPercentageBelow !== null &&
                ((struct.progress * 100 / struct.progressTotal) >= energyPercentageBelow)
            ) {
                return false;
            } else if (energyPercentageAbove !== null &&
                ((struct.progress * 100 / struct.progressTotal) <= energyPercentageAbove)
            ) {
                return false;
            }
            return true;
        }
        return false;
    },
    findMyClosestEnergyStoreToFill: function(pos, energyPercentageBelow, energyPercentageAbove) {
        var helper = this;
        var target = null;
        if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function (s) {
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_STORAGE, energyPercentageBelow, energyPercentageAbove);
            }
        });
        if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function (s) {
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_EXTENSION, energyPercentageBelow, energyPercentageAbove);
            }
        });
        if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function (s) {
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_CONTAINER, energyPercentageBelow, energyPercentageAbove);
            }
        });
        return target;
    },
    findMyClosestEnergyStoreToUse: function(pos) {
        var helper = this;
        var target = null;
        if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(s) {
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_STORAGE, 100, null);
            }
        });
        if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(s) {
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_CONTAINER, 100, null);
            }
        });
        if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(s) {
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_EXTENSION, 100, null);
            }
        });
        return target;
    },
    findClosestRawSource: function(pos) {
        var target = null;
        target = pos.findClosestByRange(FIND_SOURCES)
        return target;
    },
    findMyClosestConstructable: function(pos, structType) {
        var target = null;
        if (structType) {
            target = pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: function(c) { return (c.structureType === structType); }
            });
        } else {
            target = pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        }
        return target;
    },
    findMyClosestRechargeable: function(pos, structType, energyPercentageBelow, energyPercentageAbove) {
        var helper = this;
        var target = null;
        target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(s) {
                return helper.structureTypeAndEnergyBetween(s, structType, energyPercentageBelow, energyPercentageAbove);
            }
        });
        return target;
    },
    findMyClosestRepairable: function(pos, structType, hitsPercentage) {
        var target = null;
        if (structType) {
            target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function(s) {
                    return ((s.structureType === structType) && ((s.hits * 100 / hitsPercentage) < s.hitsMax));
                }
            });
        } else {
            target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function(s) {
                    return ((s.hits * 100 / hitsPercentage) < s.hitsMax);
                }
            });
        }
        return target;
    },
    findClosestRepairable: function(pos, structType, hitsBelow) {
        var target = null;
        if (structType) {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(s) {
                    return ((s.structureType === structType) && (s.hits < hitsBelow));
                }
            });
        } else {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(s) {
                    return (s.hits < hitsBelow);
                }
            });
        }
        return target;
    }

};
