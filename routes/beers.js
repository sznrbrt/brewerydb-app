'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');

var User = require('../models/user');

router.get('/getRandom', User.isLoggedIn, (req, res) => {
  function getOneRandom() {
    request.get({
      url: 'http://api.brewerydb.com/v2/beer/random?key=fb7c4e5814a97328a6d9f9702e095412&format=json',
    }, (err, response, body) => {

      User.findById(req.user.id, (err, user) => {
        user.ratings.forEach((r) => {
          if(r.beerId === JSON.parse(body).data.id) return getOneRandom();
        })
        return res.send(JSON.parse(body).data);
      })
    })
  }

  getOneRandom();
});



router.get('/getById/:id', (req, res) => {
  request.get({
    url: 'http://api.brewerydb.com/v2/beer/' + req.params.id + '?key=fb7c4e5814a97328a6d9f9702e095412&format=json',
  }, (err, response, body) => {
    res.send(JSON.parse(body).data);
  })
});

module.exports = router;
