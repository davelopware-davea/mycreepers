
var helper = require('helper');

var towerRoleRepairer = {

    /** @param {StructureTower} tower **/
    run: function(tower) {
        var nextToRepair = null;

        var nearestBase = Game.flags['Base_1'];
        nextToRepair = this.nextThingToRepair(tower.pos, true);
        if(nextToRepair) {
            console.log('tower essential repair '+nextToRepair.pos);
            tower.repair(nextToRepair);
            return;
        }

        nextToRepair = this.nextThingToRepair(tower.pos, false);
        if(nextToRepair) {
            tower.repair(nextToRepair);
            return;
        }

    },
    nextThingToRepair: function(pos, essentialOnly) {
        var repairTarget = null;
        var orderAttemptsEssential = [
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_SPAWN, 9 ); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 0.05); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_EXTENSION, 90); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_CONTROLLER, 90); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 10000); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_ROAD, 4000); }
        ];
        var orderAttemptsAdditional = [
            function() { return helper.findClosestRepairable(pos, STRUCTURE_ROAD, 4100); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 20000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 0.1); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 30000); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 40000); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 50000); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 60000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 0.2); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 100000); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 300000); },
            function() { return helper.findMyClosestRepairable(pos, STRUCTURE_RAMPART, 1); },
            function() { return helper.findClosestRepairable(pos, STRUCTURE_WALL, 500000); }
        ];
        var orderIndex = 0;
        while (repairTarget === null && orderIndex < orderAttemptsEssential.length) {
            repairTarget = orderAttemptsEssential[orderIndex]();
            orderIndex++;
        }
        if (repairTarget || essentialOnly) {
            return repairTarget;
        }

        orderIndex = 0;
        while (repairTarget === null && orderIndex < orderAttemptsAdditional.length) {
            repairTarget = orderAttemptsAdditional[orderIndex]();
            orderIndex++;
        }
        return repairTarget;
    },
};

module.exports = towerRoleRepairer;
