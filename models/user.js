'use strict';

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var bcrypt = require('bcryptjs');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

var userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: String, default: false },
  ratings: [{
    beerId: { type: String },
    beerName: { type: String },
    score: { type: Number },
    comment: { type: String }
  }]
});

userSchema.statics.auth = function (role) {
  return (req, res, next) => {
    var token = req.cookies.accessToken;

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if(err) return res.status(401).send({error: 'Auth required.'});

      User.findById(payload._id, (err, user) => {
        if(err || !user) return res.status(401).send({error: 'User not found.'});
        req.user = user;

        if(role === 'admin' && !req.user.isAdmin) {
          // check for admin priviliges
          return  res.status(403).send({error: 'Auth required.'});
        }
        // normal user
        next();
      });
    });
  };
};


// IT'S MIDDLEWARE!!
userSchema.statics.isLoggedIn = function(req, res, next) {
  var token = req.cookies.accessToken;

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err) return res.status(401).send({error: 'Must be authenticated.'});

    User
      .findById(payload._id)
      .select({password: false})
      .exec((err, user) => {
        if(err || !user) {
          return res.clearCookie('accessToken').status(400).send(err || {error: 'User not found.'});
        }

        req.user = user;
        next();
      })
  });
};

userSchema.statics.register = function(userObj, cb) {
  User.findOne({username: userObj.email}, (err, dbUser) => {
    if(err || dbUser) return cb(err || { error: 'Email not available.' })

    bcrypt.hash(userObj.password, 12, (err, hash) => {
      if(err) return cb(err);

      var user = new User({
        email: userObj.email,
        password: hash,
        isAdmin:  userObj.isAdmin
      })

      user.save(cb)
    })
  })
};

userSchema.statics.editProfile = function(userId, newUser, cb) {
  bcrypt.hash(newUser.password, 12, (err, hash) => {
    if(err) return cb(err);
    newUser.password = hash;
    User.findByIdAndUpdate(userId, { $set: newUser }, {new: true}, cb);
  })
};

userSchema.statics.authenticate = function(userObj, cb) {
  // find the user by the username
  // confirm the password

  // if user is found, and password is good, create a token
  this.findOne({email: userObj.email}, (err, dbUser) => {
    if(err || !dbUser) return cb(err || { error: 'Login failed. Username or password incorrect.' });

    bcrypt.compare(userObj.password, dbUser.password, (err, isGood) => {
      if(err || !isGood) return cb(err || { error: 'Login failed. Username or password incorrect.' });

      var token = dbUser.makeToken();

      cb(null, token, dbUser._id);
    })
  });
};

userSchema.statics.addRating = function(userId, ratingObj, cb) {
  User.findById(userId, (err, user) => {
    if(err) cb(err);

    user.ratings.push(ratingObj)
    user.save(cb)
  })
};

userSchema.statics.addRatingToSpecific = function(userId, beerId,ratingObj, cb) {
  User.findById(userId, (err, user) => {
    if(err) cb(err);

    var idx = 0;
    var rating = user.ratings.filter((rating, i) => {
      if(rating.beerId.toString() === beerId.toString()) idx = i;
      return rating.beerId.toString() === beerId.toString();
    })[0];

    user.ratings[idx].score = ratingObj.score || rating.score;
    user.ratings[idx].comment = ratingObj.comment || rating.comment;

    user.save(cb);
  })
};

userSchema.statics.editRating = function(userId, ratingId, ratingObj, cb) {
  User.findById(userId, (err, user) => {
    if(err) cb(err);
    var idx = 0;
    var rating = user.ratings.filter((rating, i) => {
      if(rating._id.toString() === ratingId.toString()) idx = i;
      return rating._id.toString() === ratingId.toString();
    })[0];

    user.ratings[idx].score = ratingObj.score || rating.score;
    user.ratings[idx].comment = ratingObj.comment || rating.comment;

    user.save((err) => {
      cb(err);
    })
  })
};

userSchema.statics.deleteRating = function(userId, ratingId, cb) {
  User.findById(userId, (err, user) => {
    if(err) cb(err);
    user.ratings = user.ratings.filter((rating) => {
      return rating._id.toString() !== ratingId.toString();
    });
    user.save(cb);
  })
};

userSchema.methods.makeToken = function() {
  var token = jwt.sign({
    _id: this._id,
    exp: moment().add(1, 'day').unix() // in seconds
   }, JWT_SECRET);
  return token;
};

var User = mongoose.model('User', userSchema);

module.exports = User;
