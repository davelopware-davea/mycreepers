/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('atlas');
 * mod.thing == 'a thing'; // true
 */

var defaultSetup = {
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
};

var atlas = {

    init: function(setup) {
        if (setup === undefined) {
            setup = defaultSetup;
        }
        this.config = setup['config'];
        if (! this.config) this.config = [];

        this.services = setup['services'];
        if (! this.services) this.services = [];

        this.roles = setup['roles'];
        if (! this.roles) this.roles = [];

        var innerAtlas = this;

        _.forEach(this.services, function(service) {
            service.init(innerAtlas);
        });
    },
    getConfig: function(section) {
        return this.config[section];
    },
    iocService: function(name){
        var found = this.services[name];
        if (found === undefined) {
            this.log("Unknown service ["+name+"]");
        }
        return found;
    },
    iocRole: function(name){
        var found = this.roles[name];
        if (found === undefined) {
            this.log("Unknown service ["+name+"]");
        }
        return found;
    },
    log: function(msg) {
        console.log(msg);
    },
    loop: function() {
        if (this.config['atlas']['pause']) {
            return;
        }
        console.log('Loop ===================================================');
        // return;
    
        _.forEach(this.services, function(service) {
            service.run();
        })

        var thisAtlas = this;
        _.forEach(Game.creeps, function(creep) {
            if (creep.memory.type !== 'worker' && creep.memory.type !== 'special') {
                return;
            }
            var role = creep.memory.role;
            if (role && thisAtlas.roles[role]) {
                thisAtlas.roles[role].run(creep);
            }
        });
    }
}

module.exports = atlas;