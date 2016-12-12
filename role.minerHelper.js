var spawnManager = require('spawnManager');
var backupRole = require('role.upgrader');

var roleMinerHelper = {
    dropoffTarget: {},
    energyTarget: {},
    spawn: {},
    
    loadObjectsFromMemory: function()
    {
      this.dropoffTarget = Game.getObjectById(this.creep.memory.dropoffTarget);
      this.energyTarget = Game.getObjectById(this.creep.memory.energyTarget);
      this.spawn = Game.getObjectById(this.creep.memory.spawn);
    },
    
    saveObjectsToMemory: function()
    {
      if (this.dropoffTarget != undefined && this.dropoffTarget.id != undefined)
      {
        this.creep.memory.dropoffTarget = this.dropoffTarget.id;
      }
      else
      {
        delete this.creep.memory.dropoffTarget;
      }
      
      if (this.energyTarget != undefined && this.energyTarget.id != undefined)
      {
        this.creep.memory.energyTarget = this.energyTarget.id;
      }
      else
      {
        delete this.creep.memory.energyTarget;
      }
      // this.spawn doesn't need saved.
    },
    
    parts:
    [
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],
      [CARRY,CARRY,CARRY,MOVE,MOVE],
      [CARRY,CARRY,MOVE,MOVE],
      [CARRY,CARRY,MOVE],
      [CARRY,MOVE],
    ],

    /** @param {Creep} creep **/
    run: function(creep) {
        //this.creep.memory.droppingOff = false;
        if (this.creep.memory.droppingOff && creep.carry.energy == 0)
        {
          this.creep.memory.droppingOff = false;
          this.energyTarget = this.findEnergy();
          this.creep.say("Pickup!");
        }
        
        if (!this.creep.memory.droppingOff && this.creep.carry.energy == this.creep.carryCapacity)
        {
          this.creep.memory.droppingOff = true;
          this.dropoffTarget = this.pickDropoff();
          this.creep.say("Dropoff!");
        }
        
        if (!this.creep.memory.droppingOff)
        {
          //var energyTarget = this.findEnergy(creep);
          var pickupRtn = this.creep.pickup(this.energyTarget);
          switch (pickupRtn)
          {
            case OK:
              this.creep.memory.droppingOff = true;
              break;
            case ERR_NOT_IN_RANGE:
              this.creep.moveTo(this.energyTarget);
              break;
            case ERR_INVALID_TARGET:
              this.energyTarget = this.findEnergy();
              var pickupRtn = this.creep.pickup(this.energyTarget);
              if (pickupRtn == ERR_NOT_IN_RANGE)
              {
                this.creep.moveTo(this.energyTarget);
              }
              break;
            default:
              this.creep.say("Err. " + pickupRtn);
              backupRole.run(creep);
              break;
          }
        }
        else // creep.memory.droppingOff
        {
          var xferRtn = this.creep.transfer(this.dropoffTarget, RESOURCE_ENERGY);
          switch (xferRtn)
          {
            case OK:
              // Prevents a creep from hanging out next to a repairing tower
              // if there is something higher-priority 
              this.dropoffTarget = this.pickDropoff();
              break;
            case ERR_NOT_IN_RANGE:
              this.creep.moveTo(this.dropoffTarget);
              break;
            default:
              this.dropoffTarget = this.pickDropoff();
              xferRtn = this.creep.transfer(this.dropoffTarget, RESOURCE_ENERGY);
              break;
          }
          // Saves a tick if a new dropoff was picked.
          this.creep.moveTo(this.dropoffTarget);
        }
    },
    
    findEnergy: function()
    {
      var energyList = this.getEnergyList();
      for (var i = 0; i < energyList.length; i++)
      {
        //if (energyList[i].amount > (creep.carryCapacity/2) )
        if (energyList[i].amount > 0 )
        {
          return energyList[i];
        }
      }
    },
    
    getEnergyList: function()
    {
      // 1. Check if there is no preferredSource & populate new one
      var spawner = Game.getObjectById(this.creep.memory.spawn);
      var newSourceList = spawner.room.find(FIND_DROPPED_ENERGY);

      if (newSourceList.length > 0)
      {
        // 2. Sort dropoffList by priority
        newSourceList.sort(function(a, b)
        {
          // TODO make this prioritize certain sources over others
          return b.amount - a.amount;
        });
      }

      return newSourceList;
    },
    
    pickDropoff: function()
    {
      var dropoffList = this.getDropoffList();

      for (var i = 0; i < dropoffList.length; i++)
      {
        //console.log("dropoffList idx " + i + " len: " + dropoffList[i].length);
        var tgt = this.creep.pos.findClosestByPath(dropoffList[i], {
          filter: function(dropoff)
          {
            if (dropoff.structureType == STRUCTURE_CONTAINER)
            {
              return (_.sum(dropoff.store) < dropoff.storeCapacity);
            }
            if (dropoff.structureType == STRUCTURE_STORAGE)
            {
              return (_.sum(dropoff.store) < dropoff.storeCapacity);
            }
            return (dropoff.energy < dropoff.energyCapacity);
          }
        });
        
        if (tgt != undefined && tgt.structureType != undefined)
        {
          return tgt;
        }
      }
      // console.log("Couldn't find dropoff for creep " + creep.name);
      return null;
    },

    getDropoffList: function()
    {
      // Priority map used to filter structures
      var priorityList = new Map();
      priorityList.set(STRUCTURE_SPAWN, 1);
      priorityList.set(STRUCTURE_EXTENSION, 2);
      priorityList.set(STRUCTURE_TOWER, 3);
      priorityList.set(STRUCTURE_CONTAINER, 4);
      priorityList.set(STRUCTURE_STORAGE, 5);

      // 1. Check if there is no dropoffList & populate new one
      var priorityDropoffLIst = [];
      var creep = this.creep; // Required or else creep can't be referenced in below forEach
      priorityList.forEach(function(v, k, map)
      {
        //console.log("filtering dropoffList for structure " + k + " (priority " + v);
        var newDropoffList = creep.room.find(FIND_STRUCTURES,
          {
            filter: (structure) =>
            {
              return structure.structureType == k;
            }
        });
        //console.log("getDropoffList newDropoffList: " + newDropoffList.length);

        // 2. Sort dropoffList for the given priority by its energy
        newDropoffList.sort(function(aStruct, bStruct)
        {
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
        
        // 3. Push this priority's dropoff list to the master list-of-lists
        priorityDropoffLIst.push(newDropoffList);
      });

      if (priorityDropoffLIst.length > 1)
      {
        // 3. Sory entries by priority
        priorityDropoffLIst.sort(function(a, b)
        {
          // TODO check that this is optimal
          if (a[0] != undefined && b[0] != undefined)
          {
            // Make this prioritize certain structures over others
            var priorityDiff = priorityList.get(a[0].structureType) - priorityList.get(b[0].structureType);
            return priorityDiff;
          }
          return 0;
        });
      }
      
      // 4. Return
      return priorityDropoffLIst;
    },
};

module.exports = roleMinerHelper;