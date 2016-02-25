var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../models/user.js');
var config = require('../config/database.js');

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
          if (err) {
              console.log("titi");
              return done(err, false);
          }
          if (user) {
              console.log("tutu");
              done(null, user);
          } else {
              console.log("tata");
              done(null, false);
          }
      });
  }));
};
