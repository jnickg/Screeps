var roleManager = require('roleManager');
var constructionManager = require('constructionManager');

module.exports = {
  NO_SPAWN: "_NO_SPAWN",
  
  runSpawns: function(spawns, roleAttendance)
  {
    var ownedRooms = [];
    for (var spawn in spawns)
    {
      var spawner = spawns[spawn];
      this.spawnIfNeeded(spawner, roleAttendance);
      if (ownedRooms.indexOf(spawner.room.name) == -1)
      {
        ownedRooms.push(spawner.room.name);
      }
    }
    return ownedRooms;
  },
  
  spawnIfNeeded: function(spawn, roleAttendance)
  {
    if (spawn.spawning == undefined)
    {
      var roleReqs = this.updateRoleReqs(spawn);
      var newName = "";
      var newRole = "";
      var foundReq = false;
      var creepBodies = {};
      
      // TODO TODO TODO Prioritize the building of new creeps to handle events of Holocaust.
      for (k in roleReqs)
      {
        // console.log("key is " + k);
        // console.log("spawn.id is " + spawn.id);
        // console.log("roleAttendance[spawn.id][k] is: " + roleAttendance[spawn.id][k]);
        // console.log("roleReqs[k] is: " + roleReqs[k]);
        
        // Catch annoying errors for cases where attendance is undefined or wahtever
        if (roleAttendance[spawn.id][k] == undefined)
        {
          console.log("ERROR: Attendance for role " + k + " was not found for spawn " + spawn.id);
        }
        
        if (!foundReq && roleManager.roleExists(k) && roleAttendance[spawn.id][k] < roleReqs[k])
        {
          // console.log("Found req for " + k + "; proceeding to spawn!");
          newRole = k;
          foundReq = true;
        }
      }
      
      if (!foundReq)
      {
        // No reqs to fill
        return;
      }
      
      if (newRole == undefined || !(typeof newRole === 'string'))
      {
        console.log("ERROR: Failed to parse necessary role: '" + newRole + "'");
        return;
      }
      
      //var creepBodies = roleManager.getRoleBodyParts(newRole);
      var creepBodies = roleManager.getRole(newRole).parts;
      if (creepBodies == undefined)
      {
        console.log("ERROR: Failed to get body parts for role: " + newRole);
        return;
      }
      var idx = 0;
      do {
        newName = spawn.createCreep(creepBodies[idx], undefined, {role: newRole, spawn: spawn.id});
        //console.log("Attempted to create creep " + newName);
        idx++;
      } while (newName == ERR_NOT_ENOUGH_ENERGY && idx < creepBodies.length);
      
      // Log new building if any
      if (typeof newName === 'string')
      {
        console.log('Spawn ' + spawn.id + ': Spawning new ' + newRole + ' (' + newName + ')');
      }
    }

  },
  
  updateRoleReqs: function(spawn)
  {
    var roleReqs = this.retrieveRoleReqs(spawn);
    
    if ((Game.time % 50) == 0)
    {
      var buildReqs = 0;
      buildReqs = constructionManager.detectBuilderReqsFor(spawn.room);
      if (buildReqs == 0 &&
        // TODO fix hard-coded check for whether we're in surplus
        (spawn.room.energyAvailable > spawn.room.energyCapacityAvailable + 5000))
      {
        console.log("Spawn" + spawn.id + ": Checking for other-room builder reqs for spawn " + spawn.id);
        for (var r in Game.rooms)
        {
          buildReqs += constructionManager.detectBuilderReqsFor(Game.rooms[r]);
        }
        // If they're in other rooms, transportation is a bitch.
        // console.log("Found " + buildReqs + " builder reqs. Doubling...");
        // buildReqs = buildReqs * 2;
      }
      roleReqs["builder"] = buildReqs;
    }
    
    spawn.memory.roleReqs = roleReqs;
    
    return roleReqs;
  },
  
  retrieveRoleReqs: function(spawn)
  {
    var roleReqs = spawn.memory.roleReqs;
    if (roleReqs == undefined)
    {
      // Resort to defaults
      roleReqs = {};
      
      roleReqs["miner"] = spawn.room.find(FIND_SOURCES).length;
      roleReqs["minerHelper"] = roleReqs["miner"] * 2;
      roleReqs["harvester"] = 0;
      roleReqs["builder"] = 1;
      roleReqs["upgrader"] = 1;
      
      spawn.memory.roleReqs = roleReqs;
    }
    return roleReqs;
  },
};