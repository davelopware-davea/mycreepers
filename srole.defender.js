
var helper = require('helper');
var foreman = require('service.foreman');

var sroleDefender = {

    spawn: function(spawner, memory) {
        spawner.createCreep([MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK], undefined, memory);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var myOwner = creep.owner;
        var remotePos = Game.flags[creep.memory.flagRemote].pos;
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

        if (Memory.defenderGather !== undefined) {
            var gatherFlag = Game.flags[Memory.defenderGather];
            if (creep.pos.getRangeTo(gatherFlag) > 3) {
                creep.say('D->&');
                creep.moveTo(gatherFlag);
                return;
            }
            creep.say('D...&');
            return;
        }

        var hostile = null;
        if (hostiles.length > 0) {
            var friends = [
                'damphlett',
                'Synapse791'
            ];
            _.forEach(hostiles, function(h) {
                if ( ! _.includes(friends, h.owner.username)) {
                    hostile = h;
                    console.log('Defender sees enemy '+h.toString());
                    return false;
                }
            })
        }
        if (hostile !== null) {
            var rangeToHostile = creep.pos.getRangeTo(hostile);
            var pathToHostile = creep.pos.findPathTo(hostile);
            var firstPath = pathToHostile.length > 0 ? pathToHostile[0] : null;

            if (rangeToHostile < 2) {
                // attack and run
                creep.say('D.<-');
                creep.attack(hostile);
                creep.move(helper.opposite_direction(firstPath.direction));
            } else if (rangeToHostile < 4) {
                // attack
                creep.say('D.*');
                creep.rangedAttack(hostile);
            } else if (rangeToHostile < 7) {
                // circle (and try ranged attack just in case)
                creep.say('D.0');
                creep.move(helper.away_from_stay_in_room(creep.pos, hostile.pos, pathToHostile));
                creep.rangedAttack(hostile);
            } else {
                // move toward
                creep.say('D.x');
                creep.moveTo(hostile);
            }
        } else {
            // get close but not too close to the remote pos
            var rangeToRemote = creep.pos.getRangeTo(remotePos);
            if (rangeToRemote > 5) {
                creep.say('D->');
                creep.moveTo(remotePos);
            } else {
                creep.say('D...');
            }
        }
    }
};

module.exports = sroleDefender;
