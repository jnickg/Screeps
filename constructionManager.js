module.exports = {
  findNewJobFor : function(creep)
  {
    var creepSpawn = Game.getObjectById(creep.memory.spawn);
    var targets = creepSpawn.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length == 0)
    {
      targets = [];
      //console.log("Assigning " + creep.name + " to other-room job...");
      for (var cs in Game.constructionSites)
      {
        targets.push(Game.constructionSites[cs]);
      }
    }
    
    if (targets.length == 0)
    {
      return false;
    }

    targets.sort(function(a, b)
    {
      return ((creep.pos.getRangeTo(a)) / (a.progress / a.progressTotal)) -
             ((creep.pos.getRangeTo(b)) / (b.progress / b.progressTotal));
    });

    creep.memory.currentBuild = targets[0].id;
    return true;
  },
  
  updateJobFor : function(creep)
  {
    // delete creep.memory.currentBuild;
    // Check for obsolete job and erase
    if (creep.memory.currentBuild != undefined)
    {
      var tgt = Game.getObjectById(creep.memory.currentBuild);
      if (tgt == undefined)
      {
        console.log("Creep " + creep.id + ": Deleting old job " + creep.memory.currentBuild + "...");
        delete creep.memory.currentBuild;
      }
    }
    // Check for current job
    if (creep.memory.currentBuild == undefined)
    {
      return this.findNewJobFor(creep);
    }
    
    // currentBuild is defined and valid
    return true;
  },
  
  detectBuilderReqsFor: function(room)
  {
    var targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length > 0)
    {
      var totalProgress = 0;
      var totalProgressNeeded = 0;
      for (var i = 0; i < targets.length; i++)
      {
        totalProgress += targets[i].progress;
        totalProgressNeeded += targets[i].progressTotal;
      }
      //console.log("prog: " + totalProgress + "; needed: " + totalProgressNeeded);
      return Math.ceil(Math.sqrt((totalProgressNeeded - totalProgress) / 5000));
    }
    
    return 0;
  },
};