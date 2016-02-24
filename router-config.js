var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({message: "hello welcome to my biketrack API"});
});

module.exports = router;
