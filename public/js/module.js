'use strict';

var app = angular.module('beerApp', ['ui.router', 'ui.bootstrap', 'angularSpinner', 'ngStorage']);

app.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('home', {
      url:'/',
      templateUrl: '/html/home.html',
      controller: 'homeCtrl'
    })
    .state('login', {
      url:'/login',
      templateUrl: '/html/login.html',
      controller: 'loginCtrl'
    })
    .state('register', {
      url:'/register',
      templateUrl: '/html/registration.html',
      controller: 'regCtrl'
    })
    .state('profile', {
      url:'/profile',
      templateUrl: '/html/profile.html',
      controller: 'profileCtrl'
    })
    .state('editProfile', {
      url:'/editProfile',
      templateUrl: '/html/editProfile.html',
      controller: 'editProfileCtrl'
    })
    .state('myBeers', {
      url:'/myBeers',
      templateUrl: '/html/myBeers.html',
      controller: 'myBeersCtrl'
    })
    .state('allBeers', {
      url:'/allBeers',
      templateUrl: '/html/allBeers.html',
      controller: 'allBeersCtrl'
    })
    .state('review', {
      url:'/review',
      templateUrl: '/html/review.html',
      controller: 'reviewCtrl'
    })

  $urlRouterProvider.otherwise('/');
});
