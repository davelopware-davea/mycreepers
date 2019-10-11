/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('atlas');
 * mod.thing == 'a thing'; // true
 */



var helper = require('helper');


var atlas = {

    create: function(config) {
        this.serviceSpawner = require('service.spawner');
        this.serviceForeman = require('service.foreman');
        
        this.services = {
            'foreman': serviceForeman,
            'spawner': serviceSpawner
        };
        
        this.serviceForeman.setConfig(config['foreman']);
        this.serviceSpawner.setForeman(this.serviceForeman);
    },
    /** @param {Creep} creep **/
    run: function(creep) {
    }

}

module.exports = atlas;