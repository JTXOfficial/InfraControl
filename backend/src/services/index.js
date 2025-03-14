/**
 * Service Registry
 * Central point to access all microservices
 */

const instanceService = require('./instanceService');
const userService = require('./userService');
const eventService = require('./eventService');

module.exports = {
  instanceService,
  userService,
  eventService
}; 