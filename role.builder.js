
var helper = require('helper');
var foreman = require('service.foreman');

var roleBuilder = {

    init: function(atlas) {
        this.atlas = atlas;
        this.config = this.atlas.config['role.builder'];
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('b+');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('b&');
        }

        if (creep.memory.building) {
            var buildTarget = null;
            buildTarget = foreman.nextThingToBuild(creep.pos, false);
            if (buildTarget) {
                this.log(creep.name+' build '+buildTarget.pos);
                creep.say('b#');
                if ( ! creep.pos.inRangeTo(buildTarget, 2)) {
                    creep.say('b->€');
                    creep.moveTo(buildTarget);
                } else if (creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                    creep.say('b->#');
                    creep.moveTo(buildTarget);
                }
                return;
            }
        } else {
            // var sources = creep.room.find(FIND_SOURCES);
            // helper.harvestSource(creep, sources[0], this);
            var store = helper.findMyClosestEnergyStoreToUse(creep.pos);
            if (store !== null) {
                creep.say('b-load');
                helper.harvestSource(creep, store, 'b', this);
            } else {
                creep.say('b-HELP Store');
            }
        }
    },

    log: function(msg) {
        if (this.config['log']) {
            console.log('RolBld:'+msg);
        }
    }

};

module.exports = roleBuilder;
