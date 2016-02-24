var express    = require('express');
var bodyParser = require('body-parser');
var config     = require('./router-config.js');
var app        = express();
var PORT       = process.env.PORT || 3000;

// Se connecter à la base de donnée
var mongoose   = require('mongoose');
mongoose.connect('mongodb://node:node@novus.modulusmongo.net:27017/Iganiq8o');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', config);

app.listen(PORT);
console.log("the server started on PORT : " + PORT);
