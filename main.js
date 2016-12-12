var roomManager = require('roomManager');
var worldManager = require('worldManager');
var spawnManager = require('spawnManager');
var creepManager = require('creepManager');
var towerManager = require('towerManager');

var cleanMemory = function()
{
  for(var name in Memory.creeps)
  {
    if(!Game.creeps[name])
    {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
}

module.exports.loop = function ()
{
  cleanMemory();

  // Run rooms first as it might change priority of spawns and creeps
  // worldManager.runRooms(Game.rooms);

  var roleAttendance = creepManager.runCreeps(Game.creeps);
  Memory.roleAttendance = roleAttendance;

  var ownedRooms = spawnManager.runSpawns(Game.spawns, roleAttendance);
  Memory.ownedRooms = ownedRooms;

  towerManager.runTowers();
}
