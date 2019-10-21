/*
 * Module of helper functions
 */

module.exports = {
    log_creeps: function() {
        console.log("Creeps:");
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            var type = creep.memory.type ? ' type='+creep.memory.type : ' type=unknown';
            var role = creep.memory.role ? ' role='+creep.memory.role : ' srole='+creep.memory.srole;
            var prefer = creep.memory.role == 'replenisher' ? ' prefer='+creep.memory.prefer : '';
            var base = creep.memory.flagBase ? ' base='+creep.memory.flagBase : '';
            var remote = creep.memory.flagRemote ? ' remote='+creep.memory.flagRemote : '';
            console.log(' '+name+': '+type+role+prefer+base+remote);
        }
    },
    log_structs: function(structs) {
        console.log("Structures:");
        for (var sidx in structs) {
            var structure = structs[sidx];
            console.log("  "+structure.id+": type="+structure.structureType);
        }
    },

    harvestSource: function(creep, source, prefix, role) {
        prefix = (prefix !== undefined) ? prefix : '?';
        role.log(creep.name+' harvesting '+source.toString()+' '+source.pos);
        creep.say(prefix+'+');
        if (this.getEnergyFrom(creep, source, role) == ERR_NOT_IN_RANGE) {
            // check if we're in a holding pattern
            if (creep.memory.source_holding_pattern && creep.memory.source_holding_pattern > 0) {
                var holdingFlag = Game.flags['SourceHoldingPattern'];
                creep.moveTo(holdingFlag);
                creep.memory.source_holding_pattern = creep.memory.source_holding_pattern - 1;
                creep.memory.source_waiting_for = 0;
                creep.say(prefix+'->X_'+creep.memory.source_holding_pattern);
                role.log(creep.name+' holding now for '+creep.memory.source_holding_pattern);

            } else {
                // check if we're blocking the source
                creep.memory.source_holding_pattern = undefined;
                if (creep.pos.getRangeTo(source) < 4) {
                    if (creep.memory.source_waiting_for) {
                        creep.memory.source_waiting_for = creep.memory.source_waiting_for + 1;
                    } else {
                        creep.memory.source_waiting_for = 1;
                    }
                    creep.say(prefix+'->+|'+creep.memory.source_waiting_for);
                    role.log(creep.name+' source blocked now for '+creep.memory.source_waiting_for);
                }
                if (creep.memory.source_waiting_for > 10) {
                    creep.memory.source_waiting_for = 0;
                    creep.memory.source_holding_pattern = 30;
                    role.log(creep.name+' entering the holding pattern');
                } else {
                    creep.say(prefix+'->+');
                    creep.moveTo(source);
                }
            }
        } else {
            creep.say(prefix+'+');
            creep.memory.source_waiting_for = undefined;
            creep.memory.source_holding_pattern = undefined;
        }
    },
    getEnergyFrom: function(creep, struct, role) {
        role.log(creep.name+' getting energy from '+struct.toString()+' '+struct.pos);
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
    putEnergyInto: function(creep, target, role) {
        role.log(creep.name+' putting energy into '+target.toString()+' '+target.pos);
        if (target.structureType === STRUCTURE_CONTROLLER) {
            return creep.upgradeController(target);
        }
        if (target.structureType === STRUCTURE_STORAGE ||
            target.structureType === STRUCTURE_CONTAINER ||
            target.structureType === STRUCTURE_EXTENSION ||
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
                ((struct.store[RESOURCE_ENERGY] * 100 / struct.store.getCapacity()) >= energyPercentageBelow)
            ) {
                console.log('X failed ['+struct.store[RESOURCE_ENERGY]+'] : ['+struct.store.getCapacity() + '] vs '+energyPercentageBelow);
                console.log('XX failed ['+struct.energy+'] : ['+struct.store.getCapacity() + '] vs '+energyPercentageBelow);
                return false;
            } else if (energyPercentageAbove !== null &&
                ((struct.store[RESOURCE_ENERGY] * 100 / struct.store.getCapacity()) <= energyPercentageAbove)
            ) {
                console.log('Y failed :'+struct.store[RESOURCE_ENERGY]+' : '+struct.store.getCapacity() + ' vs '+energyPercentageAbove);
                return false;
            }
            return true;
        }
        if (
            struct.structureType === STRUCTURE_STORAGE ||
            struct.structureType === STRUCTURE_CONTAINER
        ) {
            if (energyPercentageBelow !== null &&
                ((struct.store[RESOURCE_ENERGY] * 100 / struct.storeCapacity) >= energyPercentageBelow)
            ) {
                return false;
            } else if (energyPercentageAbove !== null &&
                ((struct.store[RESOURCE_ENERGY] * 100 / struct.storeCapacity) <= energyPercentageAbove)
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
                return helper.structureTypeAndEnergyBetween(s, STRUCTURE_STORAGE, null, 1);
            }
        });
        // if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
        //     filter: function(s) {
        //         return helper.structureTypeAndEnergyBetween(s, STRUCTURE_CONTAINER, 100, null);
        //     }
        // });
        // if (target === null) target = pos.findClosestByRange(FIND_MY_STRUCTURES, {
        //     filter: function(s) {
        //         return helper.structureTypeAndEnergyBetween(s, STRUCTURE_EXTENSION, null, 50);
        //     }
        // });
        if (target === null) target = helper.findClosestRawSource(pos);
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
    },
    
    
    hack_fix_harvesters: function() {
        var cnt = 0;
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.type == 'special' && creep.memory.srole == 'remoteharvester') {
            // if (creep.memory.type == 'special' && creep.memory.srole == 'roadmaintain') {
                cnt++;
                creep.memory.flagBase = 'Base_1';
                if (cnt <= 8) {
                    creep.memory.flagRemote = 'remote_1';
                } else if (cnt > 8 && cnt <= 16) {
                    creep.memory.flagRemote = 'remote_2';
                } else if (cnt > 16) {
                    creep.memory.flagRemote = 'remote_3';
                }
                console.log(' '+creep.name+' fixed');
            } else {
                console.log(' '+creep.name+' doesn\'t need fixing');
            }
        }
    },

    hack_reroute: function() {
        var cnt = 0;
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            // if (creep.memory.type == 'special' && creep.memory.srole == 'remoteharvester' && creep.memory.flagRemote == 'remote_1' && creep.carry.energy === 0) {
            if (creep.memory.type == 'special' && creep.memory.flagRemote == 'remote_1' && creep.carry.energy === 0) {
                creep.moveTo(Game.flags[creep.memory.flagRemote]);
                console.log(' '+creep.name+' fixed');
                creep.say('reroute');
            }
            // if (creep.memory.type == 'special' && creep.memory.srole == 'remoteharvester' && creep.memory.flagRemote == 'remote_3' && creep.carry.energy === 0) {
            if (creep.memory.type == 'special' && creep.memory.flagRemote == 'remote_3' && creep.carry.energy === 0) {
                creep.moveTo(Game.flags[creep.memory.flagRemote]);
                console.log(' '+creep.name+' fixed');
                creep.say('reroute');
            }
        }
    },
    
    opposite_direction: function(direction) {
        switch (direction) {
            case TOP:
                return BOTTOM;
            case TOP_RIGHT:
                return BOTTOM_LEFT;
            case RIGHT:
                return LEFT;
            case BOTTOM_RIGHT:
                return TOP_LEFT;
            case BOTTOM:
                return TOP;
            case BOTTOM_LEFT:
                return TOP_RIGHT;
            case LEFT:
                return RIGHT;
            case TOP_LEFT:
                return BOTTOM_RIGHT;
        }
    },
    away_from_stay_in_room: function(startPos, targetPos, pathCache) {
        if (pathCache === undefined) {
            pathCache = startPos.findPathTo(targetPos);
        }
        var firstStep = pathCache[0];
        var directionToTarget = firstStep.direction;

        var closeExists = startPos.findInRange(FIND_EXIT, 2);
        if (closeExists.length == 0) {
            return this.opposite_direction(firstStep.direction);
        } else {
            var firstExit = closeExists[0];
            var pathToExit = startPos.findPathTo(firstExit);
            var directionToExit = pathToExit.direction;

            // directions are numbered 1 to 8 clockwise around the compass
            // directions 4 apart are opposite
            var dirDiff = Math.abs(directionToExit - directionToTarget);
            var dirAvg = Math.round((directionToExit + directionToTarget) / 2);
            if (dirDiff === 4) {
                // we're stuck between target and exit - move away from exit!
                return this.opposite_direction(directionToExit);
            } else {
                // move away from the average direction of the target and exit
                return this.opposite_direction(dirAvg);
            }
        }
    }


};
