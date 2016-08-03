angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService) {
  $scope.username = AuthService.username();

  $scope.$on("notAuthorized", function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });

  $scope.$on("notAuthenticated", function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });

  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
})

.controller('loginCtrl', function($scope, $state, $ionicPopup, AuthService, MeFactory, TendresseFactory) {

  $scope.data = {};

  $scope.$on('$ionicView.enter', function(){
    AuthService.checkToken().then(function(authenticated) {
      // MeFactory.updateDevice();
      // goToHome();
    }, function(err) {
      console.log("token is not valid anymore");
    });
  });

  var goToHome = function(){
    TendresseFactory.getTendresses().then(function(){
      MeFactory.getFriends().then(function(){
        MeFactory.refreshProfile(AuthService.username()).then(function(){
          $state.go('tendresse.home', {}, {reload: true});
        });
      });
    });
  }

  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      $scope.data.password = "";
      // MeFactory.updateDevice();
      goToHome();
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
      $scope.data.password = "";
    });
  };

})

.controller('signupCtrl', function($scope, $state, $ionicPopup, AuthService) {

  $scope.data = {};

  $scope.sign = function(data) {
    AuthService.sign(data.username, data.password).then(function(authenticated) {
      $state.go('tendresse.home', {}, {reload: true});
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Sign-up failed!',
        template: 'error'
      });
      $scope.data.password = "";
    });
  };

})

.controller('homeCtrl', function($state, $scope, $timeout, MeFactory, TendresseFactory, $ionicPopup) {

  $scope.doRefresh = function() {
    TendresseFactory.getTendresses().then(function(){
      $scope.tendresses = TendresseFactory.tendresses();
    });
    MeFactory.getFriends().then(function(){
      $scope.friends = MeFactory.friends();
    });
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.$on('$ionicView.enter', function(){
    $scope.friends = MeFactory.friends();
  });

  $scope.sendTendresse = function(username, $event) {
    if($scope.sendingTendresse)
        return false;
    $scope.sendingTendresse = true;
    friend = angular.element($event.currentTarget);
    TendresseFactory.sendTendresse(username).then(function(response) {
      friend.addClass("animated bounceOutRight");
    }, function(err) {
      friend.addClass("animated shake");
    });
    $timeout(function(){
        friend.removeClass("animated bounceOutRight shake");
        $scope.sendingTendresse = false;
    }, 1500);
  };

  $scope.profile = function(username) {
   $state.go('friend',{"username":username});
  };


  $scope.displayTendresses = function(tendresses) {
    $ionicScrollDelegate.scrollTop();
    if (typeof tendresses[0] !== 'undefined'){
      $scope.gifUrl = tendresses[0]["gif"];
      TendresseFactory.stateTendresseAsViewed(tendresses[0]["id"]);
      tendresses.splice(0,1);
    }
  };

  $scope.addFriend = function(username,l_tendresses) {
    MeFactory.addFriend(username).then(function(response) {
      MeFactory.getFriends();
      $ionicPopup.alert({
         title: data.username_friend+" added !",
         template: 'spread the love !'
       });
      l_tendresses.isFriend = true;
    }, function(err) {
      console.log("adding friend error",err);
    });
  };

  $scope.size = function(tendresses) {
    var nbTendresses = 0;
    for (var user in tendresses) {
      for(var tendresse in tendresses[user]["tendresses"]){
          nbTendresses++;
      }
    }
    return nbTendresses;
  };

})

.controller('profileCtrl', function($state, $scope, AuthService, $ionicPopup, MeFactory) {
    $scope.data = {};

    $scope.doRefresh = function() {
      MeFactory.refreshProfile(AuthService.username()).then(function(){
        $scope.achievements = MeFactory.myAchievements();
      });
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.$on('$ionicView.enter', function(){
        $scope.achievements = MeFactory.myAchievements();
    });

    $scope.addFriend = function(data) {
      MeFactory.addFriend(data.username_friend).then(function(response) {
        $ionicPopup.alert({
           title: data.username_friend+" added !",
           template: 'spread the love !'
         });
         MeFactory.getFriends();
        $scope.data = {
          username_friend : ''
        };
      }, function(err) {
        $ionicPopup.alert({
           title: "erreur ajout "+ data.username_friend,
           template: 'try again !'
         });
      });
    };

})

.controller('friendCtrl', function($scope, $stateParams, MeFactory, $state) {

  $scope.$on('$ionicView.enter', function(){
      $scope.username = $stateParams.username;
      MeFactory.getProfile($stateParams.username).then(function(response){
          $scope.achievements = response.data.achievements;
      }).catch(function(response){
        console.log('erreur : getProfile ',response);
      }).finally(function(){
      });
  });

  $scope.removeFriend = function() {
    MeFactory.removeFriend($stateParams.username).then(function(response) {
      console.log("adding friend success");
      MeFactory.getFriends();
      $state.go('tendresse.home');
    }, function(err) {
      console.log("adding friend error",err);
    });
  };

})

.controller('menuCtrl', function($scope, AuthService, $state, $ionicPopup) {
    $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Logout',
      template: "See u soon <3"
    });
  };;
      $state.go('login');
})
;
