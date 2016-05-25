'use strict';

var app = angular.module('beerApp');

app.controller('mainCtrl', function($scope, User, $state, $sessionStorage) {
  console.log('mainCtrl');
  $scope.isLoggedIn = !!$sessionStorage.currentUser;
  $scope.$watch(function() {
    return $sessionStorage.currentUser;
  }, function(newVal, oldVal) {
    $scope.isLoggedIn = !!newVal;
  });

  $scope.logOut = () => {
    User.logout()
      .then(res => {
        console.log(res);
        $sessionStorage.currentUser = null;
        $state.go('home');
      });
  }
});

app.controller('homeCtrl', function($scope, User, $state) {
  console.log('homeCtrl');
});

app.controller('regCtrl', function($scope, User, $state, $timeout) {
  console.log('regCtrl');
  $scope.registration = {};
  $scope.success = false;
  $scope.passwordsNotMatch = false;
  $scope.register = () => {
    if($scope.registration.password1 !== $scope.registration.password2) return $scope.passwordsNotMatch = true;
    var newUser = {
      email: $scope.registration.email,
      password: $scope.registration.password1
    }
    $scope.success = true;
    User.signup(newUser)
      .then((res) => {
          $state.go('login')
      })
  }
});

app.controller('loginCtrl', function($scope, User, $state, $sessionStorage) {
  console.log('loginCtrl');
  $scope.credentials = {};
  $scope.login = () => {
    User.login($scope.credentials)
          .then(() => {
            $state.go('profile');
          });
  }
});

app.controller('profileCtrl', function($scope, User, $state, $sessionStorage) {
  console.log('profileCtrl');
  $scope.user = {};
  User.getPerson($sessionStorage.currentUser)
    .then((res) => {
      $scope.user = res.data;
    })
  $scope.editProfile = () => {
    $state.go('editProfile');
  }
});

app.controller('editProfileCtrl', function($scope, User, $state, $sessionStorage) {
  console.log('editProfileCtrl');
  $scope.editing = {};
  User.getPerson($sessionStorage.currentUser)
    .then((res) => {
      $scope.editing = res.data;
    })
  $scope.cancel = () => {
    $state.go('profile');
  }

  $scope.save = () => {
    if($scope.editing.password1 !== $scope.editing.password2) return;
    var newUser;
    if($scope.editing.password1 !== undefined) {
      newUser = {
        email: $scope.editing.email,
        password: $scope.editing.password1
      }
    } else {
      newUser = {
        email: $scope.editing.email
      }
    }
    User.editprofile(newUser)
      .then((res) => {
        User.logout()
          .then(res => {
            console.log(res);
            $sessionStorage.currentUser = null;
            $state.go('home');
          });
    })
  }
});

app.controller('myBeersCtrl', function($scope, User, $state, $sessionStorage) {
  console.log('myBeersCtrl');
  $scope.beers = {};
  User.getPerson($sessionStorage.currentUser)
    .then((res) => {
      $scope.beers = res.data.ratings;
      console.log($scope.beers);
      $scope.beers = $scope.beers.filter((beer) => {
        return beer.score !== undefined;
      })
    })
  $scope.deleteRating = (id) => {
    User.deleteRating(id)
      .then((res) => {
        User.getPerson($sessionStorage.currentUser)
          .then((res) => {
            $scope.beers = res.data.ratings;
            console.log($scope.beers);
            $scope.beers = $scope.beers.filter((beer) => {
              return beer.score !== undefined;
            })
          })
      })
  }
  
  $scope.sortBy = (order) => {
    if($scope.sortOrder === order) {
      $scope.sortOrder = "-" + order;
    } else {
      $scope.sortOrder = order;
    }
  };
});

app.controller('allBeersCtrl', function($scope, User, $state, $sessionStorage) {
  console.log('allBeersCtrl');
  $scope.notSampled = [];

  $scope.startreview = () => {
    $state.go('review');
  }

  $scope.reviewThis = (id) => {
    $state.go('reviewspecific', { "id": id });
  }

  User.getNotSampled()
    .then((res) => {
      $scope.notSampled = res.data;
    })
});

app.controller('reviewCtrl', function($scope, User, $state, $sessionStorage, BeerAPI) {
  console.log('reviewCtrl');
  $scope.beer = {};
  $scope.loading = true;
  $scope.rating = {};
  BeerAPI.getRandom()
    .then((res) => {
      $scope.beer = res.data;
      $scope.loading = false;
    })
  $scope.rate = () => {
    var ratingObj = {
      beerId: $scope.beer.id,
      beerName: $scope.beer.name,
      score: $scope.rating.score,
      comment: $scope.rating.comment
    }
    User.addRating(ratingObj)
      .then((res) => {
        $scope.loading = true;
        BeerAPI.getRandom()
          .then((res) => {
            $scope.beer = res.data;
            $scope.loading = false;
          })
      })
  }

  $scope.notsampled = () => {
    console.log('whhaaat');
    var ratingObj = {
      beerId: $scope.beer.id,
      beerName: $scope.beer.name,
      score: undefined,
      comment: undefined
    }
    User.addRating(ratingObj)
      .then((res) => {
        $scope.loading = true;
        BeerAPI.getRandom()
          .then((res) => {
            $scope.beer = res.data;
            $scope.loading = false;
          })
      })
  }

});
app.controller('reviewspecificCtrl', function($scope, User, $state, $sessionStorage, BeerAPI, $stateParams) {
  console.log('reviewspecificCtrl');
  $scope.beer = {};
  $scope.loading = true;
  $scope.rating = {};

  BeerAPI.getById($stateParams.id)
    .then((res) => {
      $scope.beer = res.data;
      $scope.loading = false;
    })

  $scope.rate = () => {
    var ratingObj = {
      beerId: $scope.beer.id,
      beerName: $scope.beer.name,
      score: $scope.rating.score,
      comment: $scope.rating.comment
    }
    User.addRatingToSpecific(ratingObj.beerId, ratingObj)
      .then((res) => {
        $state.go('allBeers')
      })
  }

  $scope.notsampled = () => {
    $state.go('allBeers')
  }

});
