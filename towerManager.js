
var towerManager = {
  TWR_MAX_WALL : "maxWall",
  
  runTowers: function()
  {
    var towers = Memory.towers;
    var attendanceTick = 500;
    if (towers == undefined || (Game.time % attendanceTick) == 0)
    {
      console.log("Updating tower attendance...");
      towers = [];
      for (var structureId in Game.structures)
      {
        var structure = Game.getObjectById(structureId);
        if (structure.structureType == STRUCTURE_TOWER)
        {
          towers.push(structure.id);
          if ((Game.time % (attendanceTick * 10)) == 0)
          {
            var newMax = towerManager.updateMaxWall(structure);
            console.log("Tower " + structureId + ": Updating max wall hp for room to " + newMax);
          }
        }
      }
      Memory.towers = towers;
    }
    for (var i = 0; i < towers.length; i++)
    {
      towerManager.runTower(Game.getObjectById(towers[i]));
    }
  },
  
  runTower: function(tower)
  {
    if (!tower)
    {
      return;
    }
    
    this.initTowerMem(tower);
    
    var maxWall = Memory.rooms[tower.room.name][this.TWR_MAX_WALL];
    
    if (tower)
    {
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if(closestHostile)
      {
        tower.attack(closestHostile);
      }
      else
      {
        var damagedStructures = tower.room.find(FIND_STRUCTURES, {
        filter: function(structure) 
          {
            return ((structure.hits < structure.hitsMax)
              && (structure.structureType == STRUCTURE_WALL ? structure.hits < maxWall : true)
              && (structure.structureType == STRUCTURE_RAMPART ? structure.hits < maxWall : true));
          }
        });
        
        damagedStructures.sort(function(a,b)
        {
          // Priority balanced between lower absolute HP and lower HP%
          return ((a.hits / a.hitsMax) * a.hits) - ((b.hits / b.hitsMax) * b.hits);
        });
        if (damagedStructures.length)
        {
          // Do most damaged one fitting filter criteria
          tower.repair(damagedStructures[0]);
        }
      }
    }
  },
  
  initTowerMem: function(tower)
  {
    //console.log("Tower room:" + tower.room);
    if (Memory.rooms[tower.room.name] == undefined)
    {
      Memory.rooms[tower.room.name] = {};
      Memory.rooms[tower.room.name][this.TWR_MAX_WALL] = 5000;
    }
  },
  
  updateMaxWall: function(tower)
  {
    if (!tower) return;
    
    var maxWall = Memory.rooms[tower.room.name][this.TWR_MAX_WALL];
    var increases = 0;
    var newMaxWall = 0; 
    var damagedStructures = [];
    do
    {
      newMaxWall = maxWall + (1000 * increases);
      damagedStructures = tower.room.find(FIND_STRUCTURES, {
        filter: function(structure) 
        {
          return ((structure.structureType == STRUCTURE_WALL ? structure.hits < newMaxWall : false)
            || (structure.structureType == STRUCTURE_RAMPART ? structure.hits < newMaxWall : false));
        }
      });
      increases++;
    } while (damagedStructures.length == 0);
    
    if (damagedStructures.length >= 0)
    {
      Memory.rooms[tower.room.name][this.TWR_MAX_WALL] = newMaxWall;
      return newMaxWall;
    }
    
    return maxWall;
  },
};

module.exports = towerManager;