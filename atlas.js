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
    'structroles': {
        'tower.repairer': require('trole.repairer'),
    },
    'config': {
        'atlas': {
            'pause': false,
        },
        'service.foreman': {
            'default': {
                'builder': 2,
                'upgrader': 2,
                'harvester': 0,
                'replenisher': 5
            },
            'energyNeeded': {
                'builder': 2,
                'upgrader': 2,
                'harvester': 0,
                'replenisher': 5
            },
            'buildingNeeded': {
                'builder': 2,
                'upgrader': 2,
                'harvester': 0,
                'replenisher': 5
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

        this.structroles = setup['structroles'];
        if (! this.structroles) this.structroles = [];

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
        console.log('Loopish '+this.config['atlas']['pause']);
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
console.log('  >creep '+creep.name+'('+creep.memory.role+')');
            if (creep.memory.type !== 'worker' && creep.memory.type !== 'special') {
                return;
            }
            var role = 'role.'+creep.memory.role;
            if (role && thisAtlas.roles[role]) {
console.log('  >creep role run');
                thisAtlas.roles[role].run(creep);
            }
        });
        
        var myStructures = Game.structures;
        _.forEach(myStructures, function(struct){
            if (struct.structureType === STRUCTURE_TOWER) {
                var tower = struct;
                if (thisAtlas.structroles['tower.repairer'] !== undefined) {
                    thisAtlas.structroles['tower.repairer'].run(tower);
                }
            }
        });

    }
}

module.exports = atlas;