var spawnManager = require('spawnManager');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var droppingOff = creep.memory.droppingOff;
        var dropoffTarget = Game.getObjectById(creep.memory.dropoffTarget);
        
        if (droppingOff && creep.carry.energy == 0)
        {
          droppingOff = false;
          creep.say("Harvesting!");
        }
        
        if (!droppingOff && creep.carry.energy == creep.carryCapacity)
        {
          droppingOff = true;
          dropoffTarget = this.pickDropoff(creep);
          creep.say("Dropoff!");
        }
        
        if (!droppingOff)
        {
          var src = this.pickSource(creep);
          if (creep.harvest(src) == ERR_NOT_IN_RANGE)
          {
            creep.moveTo(src);
          }
        }
        else
        {
          // if (creep.transfer(spawnManager.getDefaultSpawn(), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
          // {
            // creep.moveTo(spawnManager.getDefaultSpawn());
          // }
          var xferRtn = creep.transfer(dropoffTarget, RESOURCE_ENERGY);
          if (xferRtn == ERR_NOT_IN_RANGE)
          {
            creep.moveTo(dropoffTarget);
          }
          else if (xferRtn == ERR_FULL || xferRtn == ERR_INVALID_TARGET || xferRtn == ERR_NOT_OWNER)
          {
            dropoffTarget = this.pickDropoff(creep);
            xferRtn = creep.transfer(dropoffTarget, RESOURCE_ENERGY);
            if (xferRtn == ERR_NOT_IN_RANGE)
            {
              creep.moveTo(dropoffTarget);
            }
          }
        }
        
        creep.memory.droppingOff = droppingOff;
        if (dropoffTarget != undefined)
        {
          creep.memory.dropoffTarget = dropoffTarget.id;
        }
    },
    
    pickSource: function(creep)
    {
      var sourceList = this.updateSourceList(creep);
      var sources = [];
      for (var i = 0; i < sourceList.length; i++)
      {
        sources.push(Game.getObjectById(sourceList[i]));
      }
      return creep.pos.findClosestByPath(sources, {
        filter: function(source)
        {
          return source.energy > 0;
        }
      });
    },
    
    updateSourceList: function(creep)
    {
      // 0. Check if preferredSource is obsolete & erase it
      // TODO
      if (creep.memory.preferredSource != undefined)
      {
        delete creep.memory.preferredSource;
      }

      // 1. Check if there is no preferredSource & populate new one
      var newSourceList = creep.memory.sourceList;
      if (newSourceList == undefined)
      {
        newSourceList = [];
        var targets = creep.room.find(FIND_SOURCES);
        for (var i = 0; i < targets.length; i++)
        {
          newSourceList.push(targets[i].id);
        }
      }

      // 2. Sort dropoffList by priority
      newSourceList.sort(function(a, b)
      {
        var aStruct = Game.getObjectById(a);
        var bStruct = Game.getObjectById(b);
        // TODO make this prioritize certain sources over others
        return (bStruct.energy / bStruct.energyCapacity) -
               (bStruct.energy / bStruct.energyCapacity);
      });
      
      // 3. Export to creep memory
      creep.memory.sourceList = newSourceList;
      
      return newSourceList;
    },
    
    pickDropoff: function(creep)
    {
      var dropoffList = this.getDropoffList(creep);
      // This list is prioritized so return the first one into which
      // resources can be dropped off
      for (var i = 0; i < dropoffList.length; i++)
      {
        if (dropoffList[i].energy < dropoffList[i].energyCapacity)
        {
          return dropoffList[i];
        }
        
        if (dropoffList[i].structureType == STRUCTURE_CONTAINER)
        {
          if ((dropoffList[i].store[RESOURCE_ENERGY] < 3000)
            && (_.sum(dropoffList[i].store) < dropoffList[i].storeCapacity))
          {
            return dropoffList[i];
          }
        }
        
        if (dropoffList[i].structureType == STRUCTURE_STORAGE)
        {
          if ((dropoffList[i].store[RESOURCE_ENERGY] < 50000)
            && (_.sum(dropoffList[i].store) < dropoffList[i].storeCapacity))
          {
            return dropoffList[i];
          }
        }
      }
      console.log("Couldn't find dropoff for creep " + creep.name);
      return null;
    },
    
    getDropoffList: function(creep)
    {
      // Priority map used to filter structures
      var priorityList = new Map();
      priorityList.set(STRUCTURE_SPAWN, 1);
      priorityList.set(STRUCTURE_EXTENSION, 2);
      priorityList.set(STRUCTURE_TOWER, 3);
      priorityList.set(STRUCTURE_CONTAINER, 4);
      priorityList.set(STRUCTURE_STORAGE, 5);

      // 1. Check if there is no dropoffList & populate new one
      var newDropoffList = creep.room.find(FIND_STRUCTURES,
        {
          filter: (structure) =>
          {
            return priorityList.get(structure.structureType) != undefined;
          }
        });

      // 2. Sort dropoffList by priority
      // TODO Make this an array of arrays, so creeps can find the nearest
      // of a pool of same-priority dropoffs
      newDropoffList.sort(function(aStruct, bStruct)
      {
        // Make this prioritize certain structures over others
        var priorityDiff = priorityList.get(aStruct.structureType) - priorityList.get(bStruct.structureType);
        
        // Below doesn't work for CONTAINER or STORAGE because they use
        // the dropoff.store[RESOURCE_ENERGY] style, but that's OK for now
        // because they're low priority
        if (priorityDiff != 0)
        {
          return priorityDiff;
        }
        
        var nrgDiff = {
          a : aStruct.energy,
          aCapacity : aStruct.energyCapacity,
          
          b : bStruct.energy,
          bCapacity : bStruct.energyCapacity,
          
          calcDiff : function()
          {
            return (this.a / this.aCapacity) - (this.b / this.bCapacity);
          }
        };
        
        // If they use a different API, use that!
        if (aStruct.structureType == STRUCTURE_STORAGE || aStruct.structureType == STRUCTURE_CONTAINER)
        {
          nrgDiff.a = aStruct.store[RESOURCE_ENERGY];
          nrgDiff.aCapacity = aStruct.storeCapacity;
        }
        
        if (bStruct.structureType == STRUCTURE_STORAGE || bStruct.structureType == STRUCTURE_CONTAINER)
        {
          nrgDiff.b = bStruct.store[RESOURCE_ENERGY];
          nrgDiff.bCapacity = bStruct.storeCapacity;
        }
        
        return nrgDiff.calcDiff();
      });
      
      // 4. Return
      return newDropoffList;
    }
};

module.exports = roleHarvester;