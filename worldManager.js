var roomManager = require('roomManager');

var worldManager =
{
  runRooms: function(rooms)
  {
    for (var r in rooms)
    {
      roomManager.runRoom(rooms[r]);
    }
  },
};

module.exports = worldManager;