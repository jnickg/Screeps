var roleClaimer = {
  parts:
  [
    [CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH],
    // [CLAIM,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH],
  ],
  
  run: function(creep)
  {
    // If it's a new room, move to it the old school way
    if (creep.room == Game.getObjectById(creep.memory.spawn).room)
    {
      creep.moveTo(new RoomPosition(6, 18, 'W8N7'));
      return;
    }

    var target = Game.getObjectById("1039077215080e1");
    var claimComplete = creep.memory.claimComplete;

    if (target == undefined)
    {
      creep.say("No Claim!");
      return;
    }
    
    if (!claimComplete)
    {
      this.tryClaim(creep, target);
    }
    else
    {
      this.goHomeToDie(creep);
    }
  },
  
  tryClaim(creep, target)
  {
    var claimRtn = creep.claimController(target);
    if (claimRtn == ERR_NOT_IN_RANGE)
    {
      creep.moveTo(target);
    }
    if (claimRtn == OK)
    {
      creep.say("Claimed!");
      creep.memory.claimComplete = true;
    }
  },
  
  goHomeToDie(creep)
  {
    creep.suicide();
  }
};

module.exports = roleClaimer;