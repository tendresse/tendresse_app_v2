angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('AuthService', ['$http', '$q',function($http, $q){

  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var USERNAME;
  var username = '';
  var isAuthenticated = false;
  var authToken;

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(username,token) {
  	window.localStorage.setItem(USERNAME, username);
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
    // Set the token as header for your requests!
    $http.defaults.headers.common['Authorization'] = token;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['Authorization'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(USERNAME);
  }

  var login = function(username, password) {
    return $q(function(resolve, reject) {
    	// Build the request object
  		var req = {
  		  method: 'PUT',
  		  url: 'http://localhost:5000/api/v1/users',
  		  headers: {
  		    'Content-Type': 'application/json'
  		  },
  		  data: {
  		    "username": username,
  		    "password": password
  		  }
  		};

  		// Make the API call
  		$http(req).success(function(resp){
  		    storeUserCredentials(resp.username,resp.token);
          	resolve('Login success.');
  		}).error(function(error){
            reject('Login Failed.');
  		});
    });
  };

  var sign = function(username, password) {
    return $q(function(resolve, reject) {
    	// Build the request object
		var req = {
		  method: 'POST',
		  url: 'http://localhost:5000/api/v1/users',
		  headers: {
		    'Content-Type': 'application/json'
		  },
		  data: {
		    "username": username,
		    "password": password
		  }
		};

		// Make the API call
		$http(req).success(function(resp){
		    storeUserCredentials(resp.username,resp.token);
        	resolve('Signup success.');
		}).error(function(error){
          reject('Signup Failed.');
		});
    });
  };

  var checkToken = function() {
      return $q(function(resolve, reject) {
          var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
          if (token) {
            var req = {
              method: 'GET',
              url: 'http://localhost:5000/api/v1/users/me/reset_token',
              headers: {
                'Content-Type': 'application/json'
              }
            };
            $http(req).success(function(resp){
                storeUserCredentials(resp.username,resp.token);
                  resolve('login/reset token success');
            }).error(function(error){
                  reject('login/reset token error');
            });
          }
      });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function() {
    return (isAuthenticated);
  };

  loadUserCredentials();

  return {
  	sign: sign,
    login: login,
    logout: logout,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return window.localStorage.getItem(USERNAME);},
    checkToken: checkToken
  };

}])

.factory('AuthInterceptor', ['$rootScope', '$q', function($rootScope, $q){

  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: "notAuthenticated",
        403: "notAuthorized",
        503: "serverDown"
      }[response.status], response);
      return $q.reject(response);
    }
  };

}])

.factory('TendresseFactory', ['$http', '$q', function($http, $q){
    var tendresses=[];

    var getTendresses = function() {
      return $q(function(resolve, reject) {
        var req = {
          method: 'GET',
          url: 'http://localhost:5000/api/v1/users/me/pending',
        };
        $http(req).success(function(resp){
              tendresses = resp;
              resolve('tendresse state as viewed.');
        }).error(function(error){
              reject('error stating tendresse as viewed');
        });
      });
    };

    var getNbTendresses = function(){
      var nbTendresses = 0;
      for (var user in tendresses) {
        for(var tendresse in tendresses[user]["tendresses"]){
            nbTendresses++;
        }
      }
      return nbTendresses;
    }

    var stateTendresseAsViewed = function(id){
      return $q(function(resolve, reject) {
        var req = {
          method: 'DELETE',
          url: 'http://localhost:5000/api/v1/users/me/pending',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "tendresse_id": id
          }
        };
        $http(req).success(function(resp){
              resolve('tendresse state as viewed.');
        }).error(function(error){
              reject('error stating tendresse as viewed');
        });
      });
    }

    var sendTendresse = function(username){
      return $q(function(resolve, reject) {
        var req = {
          method: 'POST',
          url: 'http://localhost:5000/api/v1/users/me/send',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "username_friend": username
          }
        };
        $http(req).success(function(resp){
              resolve('tendresse state as viewed.');
        }).error(function(error){
              reject('error stating tendresse as viewed');
        });
      });
    }


    return {
        getTendresses: getTendresses,
        sendTendresse: sendTendresse,
        stateTendresseAsViewed: stateTendresseAsViewed,
        nbTendresses: getNbTendresses,
        tendresses: function(){return tendresses;}
    };

}])

.factory('MeFactory', ['$http', '$q', 'TendresseFactory', function($http, $q, TendresseFactory, AuthService){
    var friends = [];
    var achievements = [];
    var TOKEN;

    var storePushToken = function(d_token){
      window.localStorage.setItem(TOKEN, token);
    }

    var updateDevice = function() {
      return $q(function(resolve, reject) {
        var req = {
          method: 'PUT',
          url: 'http://localhost:5000/api/v1/users/me/device',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "device_token": window.localStorage.getItem(TOKEN)
          }
        };
        $http(req).success(function(resp){
              resolve('device updated');
        }).error(function(error){
              reject('error updating device');
        });
      });
    };

    var addFriend = function(username) {
      return $q(function(resolve, reject) {
        var req = {
          method: 'POST',
          url: 'http://localhost:5000/api/v1/users/me/friends',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "username_friend": username
          }
        };
        $http(req).success(function(resp){
              resolve('friend added');
        }).error(function(error){
              reject('error adding friend');
        });
      });
    };

    var removeFriend = function(username) {
      return $q(function(resolve, reject) {
        console.log("friend username = ",username);
        var req = {
          method: 'DELETE',
          url: 'http://localhost:5000/api/v1/users/me/friends',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "username_friend": username
          }
        };
        $http(req).success(function(resp){
              resolve('friend removed');
        }).error(function(error){
          console.log(error);
              reject('error removing friend');
        });
      });
    };

    var getFriends = function() {
      return $q(function(resolve, reject) {
        var req = {
    		  method: 'GET',
    		  url: 'http://localhost:5000/api/v1/users/me/friends',
    		};
    		$http(req).success(function(resp){
    		    friends = resp;
            resolve('friend added');
        }).error(function(error){
            reject('error adding friend');
        });
      });
    };

    var getProfile = function(username){
      return $http.get('http://localhost:5000/api/v1/users/'+username+'/profile');
    }

    var refreshProfile = function(username){
      return $q(function(resolve, reject) {
        var req = {
          method: 'GET',
          url: 'http://localhost:5000/api/v1/users/'+username+'/profile',
        };
        $http(req).success(function(resp){
            achievements = resp.achievements;
            resolve('profiled refreshed');
        }).error(function(error){
            reject('error refreshing profile');
        });
      });
    }

    return {
        addFriend: addFriend,
        getFriends: getFriends,
        getProfile: getProfile,
        removeFriend: removeFriend,
        friends: function(){return friends;},
        updateDevice: updateDevice,
        refreshProfile: refreshProfile,
        myAchievements: function(){return achievements}
    };

}])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

;
