/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('itemFinder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
  findItemNearestTo : function(object, itemType)
  {
    return object.pos.findClosestByPath(itemType);
  }
};