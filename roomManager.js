var constructionManager = require('constructionManager');
var roleManager = require('roleManager');

var roomManager =
{

  runRoom: function(room)
  {
    this.initMemoryIfNeeded(room);
  },
  
  initMemoryIfNeeded : function(room)
  {
    // If no requirements exist at all, initialize.
    if (room.memory.roleReqs == undefined)
    {
      room.memory.roleReqs = this.getDefaultRoleReqs(room);
    }
    if (room.memory.roleCkTicks == undefined)
    {
      room.memory.roleCkTicks = {};
      for (var r = 0; r < roleManager.roles.length; r++)
      {
        room.memory.roleCkTicks[roleManager.roles[r] = 5;
      }
    }
    // Initialize memory for any new role that may have been newly added
    for (var r = 0; r < roleManager.roles.length; r++)
    {
      if (room.memory.roleReqs[roleManager.roles[r] == undefined);
      {
        room.memory.roleReqs[roleManager.roles[r] = 0;
      }
      if (oom.memory.roleCkTicks[roleManager.roles[r] == undefined)
      {
        oom.memory.roleCkTicks[roleManager.roles[r] = 5;
      }
    }
    

  },
  
  updateRoleReqs: function(room)
  {
    if (room.memory.roleReqs == undefined)
    {
      room.memory.roleReqs = this.getDefaultRoleReqs(room);
    }
    
    // Update builder Reqs
    var ckTicks = room.memory.roleCkTicks[roleManager.roles[roleManager.ROLE_BUILDER]];
    if ((Game.time % ckTicks) == 0)
    {
      var buildReqs = constructionManager.detectBuilderReqsFor(room);
      if (buildReqs == 0 &&
        // TODO fix hard-coded check for whether we're in surplus
        (spawn.room.energyAvailable > (spawn.room.energyCapacityAvailable + 5000)))
      {
        console.log("Spawn" + spawn.id + ": Checking for other-room builder reqs for spawn " + spawn.id);
        for (var r in Game.rooms)
        {
          buildReqs += constructionManager.detectBuilderReqsFor(Game.rooms[r]);
        }
      }
      room.memory.roleReqs[roleManager.roles[roleManager.ROLE_BUILDER]] = buildReqs;
    }
  },
  
  getDefaultRoleReqs: function(room)
  {
    var roleReqs = {};
    
    for (var r = 0; r < roleManager.roles.length; r++)
    {
      roleReqs[roleManager.roles[r] = 0;
    }
    
    // Start with one miner per source
    roleReqs[roleManager.roles[roleManager.ROLE_MINER]] =
      room.find(FIND_SOURCES).length;
    
    // ... And two helpers per miner
    roleReqs[roleManager.roles[roleManager.ROLE_MINERHELPER]] =
      roleReqs[roleManager.roles[roleManager.ROLE_MINER]] * 2;
    
    // Start builder roles based on what needs built
    roleReqs[roleManager.roles[roleManager.ROLE_BUILDER]] =
      constructionManager.detectBuilderReqsFor(room);
    
    // And one upgrader to keep the room from downgrading
    roleReqs[roleManager.roles[roleManager.ROLE_UPGRADER]] = 1;
    
    return roleReqs;
  },

};

module.exports = roomManager;