var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var User        = require('./models/user.js');
var _           = require('underscore');
var utils       = require('./utils.js');
var passport    = require('passport');
var config      = require('./config/database.js');
var passportcfg = require('./config/passport.js');
var mongoose    = require('mongoose');
var jwt         = require('jwt-simple');
var token       = require('./utils/token.js');
var PORT        = process.env.PORT || 3000;

// recuperation du body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// initialize passport
app.use(passport.initialize());

// connection a la base de donnée mongo
mongoose.connect(config.database);

// change the pass of passport
require('./config/passport')(passport);

// root of my app
app.get('/', function(req, res) {
  res.json({message: "hello welcome to my biketrack API"});
});

// creation de nos routes
var apiRoutes = express.Router();

apiRoutes.get("/users/getall", function(req, res){
  User.find(function(err, users){
    if (err) {
      res.send(err);
    }
    res.json(users);
  });
});

apiRoutes.post('/users/login', function(req, res) {
  console.log("body.username" + req.body.username);
  User.findOne({
    username: req.body.username
  }, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        res.status(404).json({error: "User not found"});
      } else {
        user.comparePassword(req.body.password, function(err, isMatch){
          if (isMatch && !err) {
            var token = jwt.encode(user, config.secret);
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.status(400).json({error:"Auth failed, wrong password"});
          }
        });
      }
  });
});

apiRoutes.route('/users')
.get(passport.authenticate('jwt', {session: false}), function(req, res, next) {
  var t = token.get(req.headers);
  if (t) {
    token.decode(t).then(function(data) {
      res.json({success: true, message: "Welcome " + data.username});
    }, function(error) {
      res.status(403).json({success: false, message: "Auth failed. User not found"});
    });
  } else {
    res.status(403).json({success: false, message: "No token provided"});
  }
})
.post(function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({error: "Please pass username or password"});
  } else {
    var newUser = new User ({
      username: req.body.username,
      password: req.body.password
    });
    newUser.save(function(err) {
      if (err) {
        return res.status(400).json({error: "Username already exist"});
      }
      res.json({sucess: true, message:"Successful created new user"});
    });
  }
});

apiRoutes.route('/bikes')
.post(passport.authenticate('jwt', {session: false}), function(req, res, next){
  console.log("body = " + req.body.longitude);
  var t = token.get(req.headers);

  if (t) {
    token.decode(t).then(function(data) {
      console.log(req.body);
      var name = req.body.name;
      var longitude = req.body.longitude;
      var latitude = req.body.latitude;

      if (!name || !longitude || !latitude) {
        res.status(400).json({error: "Missing name or longitude or latitude"});
      } else {
        var bike = {
          name: name,
          long: longitude,
          lat: latitude
        };
        data.update({$push: {bike: bike}}, function(err) {
          if (err) {
            console.error(err);
          }
          res.json(bike);
        });
      }
    }, function(e) {
      res.status(403).json({success: false, message: "Auth failed. User not found"});
    });
  } else {
    res.status(403).json({success: false, message: "No token provided"});
  }
})
.get(passport.authenticate('jwt', {session: false}), function(req, res, next) {
  var t = token.get(req.headers);
  if (t) {
    token.decode(t).then(function(data) {
      res.json(data.bike);
    }, function(error) {
      res.status(403).json({success: false, message: "Auth failed. User not found"});
    });
  } else {
    res.status(403).json({success: false, message: "No token provided"});
  }
});



app.use('/api', apiRoutes);

app.listen(PORT);

console.log("the server started on PORT : " + PORT);

// // Se connecter à la base de donnée
// mongoose.connect('mongodb://localhost/db');
//

//

//
// // POST methods
// app.post('/users', function(req, res){
//   var body = _.pick(req.body, 'username', 'password');
//   var user = new User();
//
//   if (!_.isString(body.username) || !_.isString(body.password) || _.isEmpty(body.password) || _.isEmpty(body.username)) {
//     return res.status(400).send();
//   }
//
//   user.username = body.username.trim();
//   user.password = body.password;
//   user.save(function(err){
//     if (err) {
//       res.send(err);
//     }
//     res.json({message: "the user have been created"});
//   });
// });
//
// app.post('/users/login', function(req, res) {
//   var body = _.pick(req.body, 'username', 'password');
//
//   utils.authenticate(body).then(function(user) {
//     res.header('Auth', utils.generateToken('authentication', user)).json({message: "authenticate was good"});
//     console.log("toto");
//   }, function(e) {
//     res.status(401).send();
//   });
// });
//
// app.put('users/:id', function(req, res) {
//   var body = _.pick(req.body, "latitude", "longitude", "name");
//   var match;
//
//   if (!_.isString(body.username) || _.isEmpty(body.username) || !_.isNumber(body.latitude) || !_.isNumber(body.longitude)) {
//     return res.status(400).send();
//   }
//
//   User.findById(req.params.id, function(err, user) {
//     if (err) {
//       res.send(err);
//     }
//     match = _.findWhere(user.bike, {name: body.name});
//     if (typeof match === "undefined") {
//       var bike = {
//         name: body.name,
//         longitude: body.longitude,
//         latitude: body.latitude
//       };
//       user.bike.push(bike);
//     } else {
//       match.longitude = body.longitude;
//       match.latitude = body.latitude;
//     }
//     user.save(function(err){
//       if (err) {
//         res.send(err);
//       }
//       res.json({ message: 'User updated!' });
//     });
//   });
// });
//
// // GET methods

//
// app.get("/users/:username", function(req, res){
//   User.find({username: req.params.username}, function(err, user) {
//     if (err) {
//       res.send(err);
//     }
//     res.json(_.pick(user, 'username', 'created_at', 'updated_at'));
//   });
// });
