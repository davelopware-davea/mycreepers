var helper = require('helper');

var roleUpgrader = {

    init: function(atlas) {
        this.atlas = atlas;
        this.config = this.atlas.config['role.upgrader'];
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        this.log('Upgrader ................................................');

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            creep.say('u$');
            if ( ! creep.pos.inRangeTo(creep.room.controller, 2)) {
                creep.say('u->€');
                creep.moveTo(creep.room.controller);
            } else if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.say('u->$');
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            creep.say('u+');
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                helper.harvestSource(creep, sources[0], 'u', this);
            }
        }
    },

    log: function(msg) {
        if (this.config['log']) {
            console.log('RolUpg:'+msg);
        }
    }

};

module.exports = roleUpgrader;
