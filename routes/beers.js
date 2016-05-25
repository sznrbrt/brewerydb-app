'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');


router.get('/getRandom', (req, res) => {
  request.get({
    url: 'http://api.brewerydb.com/v2/beer/random?key=fb7c4e5814a97328a6d9f9702e095412&format=json',
  }, (err, response, body) => {
    res.send(JSON.parse(body).data);
  })
});

router.get('/getById/:id', (req, res) => {
  console.log('id:', req.params.id);
  request.get({
    url: 'http://api.brewerydb.com/v2/beer/' + req.params.id + '?key=fb7c4e5814a97328a6d9f9702e095412&format=json',
  }, (err, response, body) => {
    console.log(body);;
    res.send(JSON.parse(body).data);
  })
});

module.exports = router;
