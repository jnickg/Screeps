var constructionManager = require('constructionManager');
var backupRole = require('role.minerHelper');

var roleBuilder = {
  parts:
  [
    [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
    [WORK,CARRY,CARRY,MOVE,MOVE],
    [WORK,CARRY,MOVE,MOVE],
  ],
  
  /** @param {Creep} creep **/
  run: function(creep)
  {
    // console.log("run builder");
    // delete creep.memory.withdrawTarget;
    var jobAssigned = constructionManager.updateJobFor(creep);
    var withdrawTarget = Game.getObjectById(creep.memory.withdrawTarget);
    var employed = creep.memory.employed;
    var building = creep.memory.building;
    
    //console.log("jobAssigned: " + jobAssigned);
    // Determine employment state before determining building state
    if (employed && !jobAssigned)
    {
      employed = false;
      creep.say("Unemployed. :C");
    }
    if (!employed && jobAssigned)
    {
      employed = true;
      creep.say("I has job!");
    }
    // Building state relies on employment state
    if(employed && building && creep.carry.energy == 0)
    {
      withdrawTarget = this.findWithdraw(creep);
      building = false;
    }
    if(employed && !building && creep.carry.energy == creep.carryCapacity)
    {
      building = true;
      creep.say('Building');
    }

    if (employed && building)
    {
      //console.log("employed && building");
      var tgt = Game.getObjectById(creep.memory.currentBuild);
      var buildRtn = creep.build(tgt);
      switch (buildRtn)
      {
        case OK:
          constructionManager.updateJobFor(creep);
          break;
        case ERR_NOT_IN_RANGE:
          creep.moveTo(tgt);
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          building = false;
          break;
        default:
          creep.say("Build Err. " + buildRtn);
          break;
      }
    }
    else if (employed && !building)
    {
      if (withdrawTarget == undefined)
      {
        withdrawTarget = this.findWithdraw(creep);
      }
      var withdrawRtn = creep.withdraw(withdrawTarget, RESOURCE_ENERGY);
      switch (withdrawRtn)
      {
        case OK:
          building = true;
          break;
        case ERR_NOT_IN_RANGE:
          creep.moveTo(withdrawTarget);
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          // backupRole.run(creep);
          // break;
        default:
          creep.say("WD Err. " + withdrawRtn);
          //delete creep.memory.withdrawTarget;
          withdrawTarget = this.findWithdraw(creep);
          backupRole.run(creep);
          break;
      }
    }
    else
    {
      backupRole.run(creep);
    }
    
    creep.memory.building = building;
    creep.memory.employed = employed;
    if (withdrawTarget != undefined && withdrawTarget.id != undefined)
    {
      creep.memory.withdrawTarget = withdrawTarget.id;
    }
  },
  
  findWithdraw: function(creep)
  {
    var pickupList = this.getPickupList(creep);
    //console.log("pickupList: " + pickupList.length);
    
    // TODO fix this. Why can't it find a path from its other-room build to the pickup????
    // var tgt = Game.getObjectById(creep.memory.currentBuild);
    var tgt = Game.getObjectById(creep.memory.spawn);
    
    // console.log("tgt: " + tgt.id);
    // Resort to finding the nearest to the creep, if no current build
    if (tgt == undefined || tgt.room == undefined || tgt == null)
    {
      // console.log("tgt becomes creep");
      tgt = creep;
    }
    // console.log("trying to find closest");
    // console.log("pickupList: " + pickupList.length);
    // console.log("tgt: " + tgt.id);
    var rtn = tgt.pos.findClosestByPath(pickupList);
    // console.log("withdraw from: " + rtn.id);
    return rtn;
  },
    
  getPickupList: function(creep)
  {
    var spawn = Game.getObjectById(creep.memory.spawn);
    var pickupList = spawn.room.find(FIND_STRUCTURES,
    {
      filter: (structure) =>
      {
        if (structure.structureType == STRUCTURE_STORAGE
            || structure.structureType == STRUCTURE_CONTAINER)
        {
          return structure.store[RESOURCE_ENERGY] >= creep.carryCapacity;
        }
        return false;
      }
    });
    
    // if (pickupList.length == 0)
    // {
      // pickupList = spawn.room.find(FIND_STRUCTURES,
      // {
        // filter: (structure) =>
        // {
          // if (structure.structureType == STRUCTURE_EXTENSION)
          // {
            // return structure.energy >= creep.carryCapacity;
          // }
          // return false;
        // }
      // });
    // }
    
    // console.log("pickup List: " + pickupList.length);
    return pickupList;
  }
};

module.exports = roleBuilder;
