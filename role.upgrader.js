var spawnManager = require('spawnManager');
var backupRole = require('role.harvester');

var roleUpgrader = {
    withdrawTarget: {},
    spawn: {},
    
    loadObjectsFromMemory: function()
    {
      this.withdrawTarget = Game.getObjectById(this.creep.memory.withdrawTargetId);
      this.spawn = Game.getObjectById(this.creep.memory.spawn);
    },
    
    saveObjectsToMemory: function()
    {
      this.creep.memory.withdrawTargetId = this.withdrawTarget.id;
      // this.spawn doesn't need saved.
    },
    
    parts:
    [
      //[WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE], // This one pulls energy too fast
      [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
      [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
      [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
      [WORK,WORK,WORK,CARRY,MOVE,MOVE],
      [WORK,WORK,CARRY,MOVE,MOVE],
      [WORK,CARRY,MOVE,MOVE],
      [WORK,CARRY,MOVE],
    ],
    
    /** @param {Creep} creep **/
    run: function(creep)
    {
      if (creep.memory.upgrading && creep.carry.energy == 0)
      {
          creep.memory.upgrading = false;
          this.withdrawTarget = this.findWithdraw(creep);
          creep.say('W/Drawing!');
      }
      if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity)
      {
          creep.memory.upgrading = true;
          creep.say('Upgrading!');
      }

      if (creep.memory.upgrading)
      {
        this.upgradeOperation();
      }
      else
      {
        var withdrawRtn = creep.withdraw(this.withdrawTarget, RESOURCE_ENERGY);
        switch (withdrawRtn)
        {
          case OK:
            creep.memory.upgrading = true;
            break;
          case ERR_NOT_IN_RANGE:
            creep.moveTo(this.withdrawTarget);
            break;
          case ERR_NOT_ENOUGH_RESOURCES:
            backupRole.run(creep);
            break;
          default:
            creep.say("Err. " + withdrawRtn);
            this.withdrawTarget = this.findWithdraw();
            break;
        }
      }
    },
    
    upgradeOperation: function()
    {
      var ctrl = this.spawn.room.controller;
      var upgradeRtn = this.creep.upgradeController(ctrl);
      switch (upgradeRtn)
      {
        case OK:
          break;
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(ctrl);
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          upgrading = false;
          break;
        default:
          break;
      }
    },
    
    findWithdraw: function()
    {
      var pickupList = this.getPickupList();
      var rtn = this.spawn.room.controller.pos.findClosestByPath(pickupList);
      //console.log("withdraw from: " + rtn.id);
      return rtn;
    },
    
    getPickupList: function()
    {
      var pickupList = this.spawn.room.find(FIND_STRUCTURES,
      {
        filter: (structure) =>
        {
          if (structure.structureType == STRUCTURE_STORAGE
              || structure.structureType == STRUCTURE_CONTAINER)
          {
            return structure.store[RESOURCE_ENERGY] > 0;
          }
          return false;
        }
      });
      
      if (pickupList.length == 0)
      {
        // Fall back to using spawn energy
        pickupList = this.spawn.room.find(FIND_STRUCTURES,
        {
          filter: (structure) =>
          {
            if (structure.structureType == STRUCTURE_SPAWN
              || structure.structureType == STRUCTURE_EXTENSION)
            {
              return structure.energy > 0;
            }
            return false;
          }
        });
      }
      
      //console.log("pickup List: " + pickupList.length);
      return pickupList;
    }
};

module.exports = roleUpgrader;