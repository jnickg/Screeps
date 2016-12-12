var sourceManager = require('sourceManager');
var spawnManager = require('spawnManager');

module.exports = {
    source: {},
    spawn: {},
    
    loadObjectsFromMemory: function()
    {
      this.source = Game.getObjectById(this.creep.memory.source);
      this.spawn = Game.getObjectById(this.creep.memory.spawn);
    },
    
    saveObjectsToMemory: function()
    {
      this.creep.memory.spawn = this.spawn.id;
      // this.spawn doesn't need saved.
    },

  parts:
  [
    [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
    [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
    [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE],
    [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
    [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE],
    [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
    [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE],
    [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
    [WORK,WORK,WORK,WORK,CARRY,MOVE],
    [WORK,WORK,WORK,CARRY,MOVE],
    [WORK,WORK,CARRY,MOVE],
    [WORK,CARRY,MOVE],
  ],

  run: function(creep)
  {
    if (this.spawn == undefined)
    {
      console.log("Creep " + this.creep.id + ": ERROR: Miner has no associated spawn");
    }
    if (this.source == undefined)
    {
      this.source = sourceManager.assignMinerTo(this.spawn, creep);
    }


    if (this.creep.carry.energy == this.creep.carryCapacity)
    {
      this.creep.drop(RESOURCE_ENERGY);
    }

    var harvestRtn = this.creep.harvest(this.source);
    switch (harvestRtn)
    {
      case OK:
        break;
      case ERR_NOT_IN_RANGE:
        this.creep.moveTo(this.source);
        break;
      // Catch cases where the source hasn't regenerated but
      // the miner still isn't there
      default:
        this.creep.moveTo(this.source);
        break;
    }
  },
};