'use strict';

var express = require('express');
var path = require('path');
var router = express.Router();

var User = require('../models/user');

router.get('/', (req, res) => {
  var indexPath = path.join(__dirname, '../index.html');
  res.sendFile(indexPath);
});

router.get('/secret', User.isLoggedIn, User.auth(), (req, res) => {
  res.send('Only users!');
});

router.get('/adminsecret', User.isLoggedIn, User.auth('admin'), (req, res) => {
  res.send('Only admins!');
});

module.exports = router;
