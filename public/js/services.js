'use strict';

var app = angular.module('beerApp');

app.service('User', function($http, $sessionStorage) {

  this.signup = (newUserObj) => {
    return $http.post('./api/users/register', newUserObj);
  }

  this.login = (loginDetailsObj) => {
    return $http.post('./api/users/login', loginDetailsObj)
                .then((res) => {
                  console.log(res);
                  $sessionStorage.currentUser = res.data;
                });
  }
  this.logout = (loginDetailsObj) => {
    return $http.delete('./api/users/logout', loginDetailsObj);
  }

  this.loadprofile = () => {
    return $http.get('./api/users/profile');
  }

  this.editprofile = (editedUserObj) => {
    return $http.put('./api/users/profile', editedUserObj);
  }

  this.getPeople = () => {
    return $http.get('./api/users/people');
  }

  this.getPerson = (id) => {
    return $http.get('./api/users/people/' + id);
  }

})

app.service('BeerAPI', function($http) {

  this.getRandom = () => {
    return $http.get("http://api.brewerydb.com/v2/beer/random?key=fb7c4e5814a97328a6d9f9702e095412&format=json");
  }

})

app.service('StoreData', function() {
  var storeData = {};
  this.get = () => { return storeData }
  this.set = (data) => { storeData = data }
})
