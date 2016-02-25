var User    = require('../models/user.js');
var config  = require('../config/database.js');
var jwt     = require('jwt-simple');

module.exports = {
  get: function(header) {
    if (header && header.authorization) {
      var parted = header.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  },
  decode: function (token) {
    return new Promise(function(resolve, reject){
      var decoded = jwt.decode(token, config.secret);
      User.findOne({username: decoded.username}, function(err, user){
        if (err) {
          reject("User findOne fail");
        }
        if (!user) {
          reject("User not found");
        } else {
          resolve(user);
        }
      });
    });
  }
};
