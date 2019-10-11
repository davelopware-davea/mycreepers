/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('atlas');
 * mod.thing == 'a thing'; // true
 */

var atlas = {

    init: function(setup) {
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