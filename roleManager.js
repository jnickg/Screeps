module.exports = {
  roles: [
    "harvester",
    "upgrader",
    "builder",
    "miner",
    "minerHelper",
    "claimer",
  ],
  
  // Indices for the above array
  ROLE_HARVESTER: 0,
  ROLE_UPGRADER: 1,
  ROLE_BUILDER: 2,
  ROLE_MINER: 3,
  ROLE_MINERHELPER: 4,
  ROLE_CLAIMER: 5,
  
  roleExists: function(role)
  {
    if (!(typeof role === 'string'))
    {
      return false;
    }
    
    try
    {
      require("role." + role);
      return true;
    }
    catch (e)
    {
      console.log("Failed to find role '" + role + "' due to exception: " + e);
      return false;
    }
  },

  getRole: function(role)
  {
    if(!this.roleExists(role))
    {
      return false;
    }

    var proto = require('role.prototype');
    var roleObject = require("role." + role);

    roleObject = require('prototypeExtender')(roleObject, proto);

    return roleObject;
  },

  getRoleBodyParts: function(role)
  {
    if(!this.roleExists(role))
      return false;

    var role = this.getRole(role);

    if(role.getParts !== undefined)
      return role.getParts.call(role);
    else
      return role.prototype.getParts.call(role);
  }
};