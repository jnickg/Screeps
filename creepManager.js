var roleManager = require('roleManager');
var spawnManager = require('spawnManager');

var creepManager = {
  runCreeps: function(creeps)
  {
    // 0. Initialize variables
    var roleAttendance = {};
    roleAttendance[spawnManager.NO_SPAWN] = {};
    for (var s in Game.spawns)
    {
      roleAttendance[Game.spawns[s].id] = {};
      for (var r = 0; r < roleManager.roles.length; r++)
      {
        roleAttendance[Game.spawns[s].id][roleManager.roles[r]] = 0;
      }
    }

    for (var name in creeps)
    {
      var creep = creeps[name];
      
      // 1. Skip this creep if something is wrong with it...
      if (creep.spawning ||
          creep.memory.role == undefined ||
         (creep.memory.active !== undefined && !creep.memory.active))
      {
        //console.log("Skipping creep " + creep.id + " (" + creep.name + ")");
        continue;
      }
      
      // 2. Take attendance
      var role = creep.memory.role;
      var spawn = creep.memory.spawn;
      
      if (spawn == undefined)
      {
        spawn = spawnManager.NO_SPAWN;
      }
      if (roleAttendance[spawn] == undefined)
      {
        roleAttendance[spawn] = {};
        for (var i = 0; i < roleManager.roles.length; i++)
        {
          //console.log("roleManager.roles.length " + roleManager.roles.length);
          //console.log("roleManager.roles[" + i + "] " + roleManager.roles[i]);
          roleAttendance[spawn][roleManager.roles[i]] = 0;
        }
      }
      if (roleAttendance[spawn][role] == undefined)
      {
        roleAttendance[spawn][role] = 0;
      }
      roleAttendance[spawn][role] = roleAttendance[spawn][role] + 1;
      
      // 3. Run the creep's role if it has one
      if (roleManager.roleExists(role))
      {
        role = roleManager.getRole(role);
      }
      roleObj = Object.create(role);
      try
      {
        roleObj.setCreep(creep);
        roleObj.runCreep();
      }
      catch (e)
      {
        console.log("Error running creep " + creep.id + " (" + creep.name + ")");
        console.log("Error is: " + e);
      };
    }
    
    // 4. Let client know what we ran
    return roleAttendance;
  },
};

module.exports = creepManager;