module.exports = {
  getNearestOpenSourceFor: function(spawner, creep)
  {
    this.initMem();
    var source = spawner.pos.findClosestByPath(FIND_SOURCES, {
      filter: function(source)
      {
        if (Memory.sources[source.id] == undefined ||
            Memory.sources[source.id].miner == undefined ||
            Memory.sources[source.id].miner == creep.id)
        {
          // This is definitely unused
          return true;
        }
        
        if (Game.getObjectById(Memory.sources[source.id].miner) == undefined)
        {
          // Was assigned but that creep is dead
          return true;
        }
        
        return false;
      }
    });
    
    if (source == undefined || source.id == undefined)
    {
      console.log("Issue identifying closest source.");
    }
    
    return source;
  },
  
  assignMinerTo: function(spawner, creep)
  {
    var source = this.getNearestOpenSourceFor(spawner, creep);
    console.log("Creep " + creep.id + ": Assigning " + creep.name + " to source " + source.id);
    Memory.sources[source.id] = {};
    Memory.sources[source.id].miner = creep.id;
    creep.memory.source = source.id;
    creep.memory.spawner = spawner.id;
    return source;
  },
  
  assignHarvesterTo: function(minerCreep, creep)
  {
    
  },
  
  initMem()
  {
    if (Memory.sources == undefined)
    {
      Memory.sources = {};
    }
  }
};