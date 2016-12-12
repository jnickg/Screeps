var rolePrototype = {
  /**
  * Generic body parts..................
  */
  parts:
  [
    [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
    [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
    [WORK,WORK,CARRY,MOVE,MOVE,MOVE],
    [WORK,CARRY,MOVE,MOVE,MOVE],
    [WORK,CARRY,MOVE]
  ],
  
  /**
  * The creep for this role
  *
  * @type creep
  */
  creep: null,
  
  /**
   * Set the creep for this role
   *
   * @param {Creep} creep
   */
  setCreep: function(creep)
  {
    this.creep = creep;
    return this;
  },
  
  runCreep: function()
  {
    if (this.creep.memory.onSpawned == undefined)
    {
      this.onSpawn();
      this.creep.memory.onSpawned = true;
    }
    
    this.tryLoad();
    this.run(this.creep);
    this.tryRepair();
    this.trySave();

    if (this.creep.ticksToLive == 1)
    {
      this.beforeAge();
    }
  },
  
  tryLoad: function()
  {
    try
    {
      this.loadObjectsFromMemory();
    }
    catch (e)
    {
      console.log("Creep " + this.creep.id + ": FAILED to load objects from memory due to exception: " + e);
    }
  },
  
  trySave: function()
  {
    try
    {
      this.saveObjectsToMemory();
    }
    catch (e)
    {
      console.log("Creep " + this.creep.id + ": FAILED to save objects to memory due to exception: " + e);
    }
  },
  
  tryRepair: function()
  {
    var repairs = this.creep.pos.findInRange(FIND_STRUCTURES, 3, {
      filter: function(site)
        {
          if (site.structureType == STRUCTURE_ROAD)
          {
            return (site.hits < site.hitsMax);
          }
          return false;
        }
    });
    if (repairs.length > 0 && this.creep.carry.energy > 0)
    {
      var repairRtn = this.creep.repair(repairs[0]);
      //this.creep.say("Rpr " + repairRtn);
    }
  },
  
  handleEvents: function()
  {
    if(this.creep.memory.onSpawned == undefined) {
      this.onSpawnStart();
      this.onSpawn();
      this.creep.memory.onSpawned = true;
    }

    if(this.creep.memory.onSpawnEnd == undefined && !this.creep.spawning) {
      this.onSpawnEnd();
      this.creep.memory.onSpawnEnd = true;
    }
  },

  getParts: function() { },

  onSpawn: function() { },

  loadObjectsFromMemory: function() { },

  saveObjectsToMemory: function() { },

  run: function(creep) { },

  onSpawnStart: function() { },

  onSpawnEnd: function() { },

  beforeAge: function() { },
};

module.exports = rolePrototype;