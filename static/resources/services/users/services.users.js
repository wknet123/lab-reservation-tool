(function() {
  
  'use strict';
  
  angular
    .module('services.users', [])
    .factory('UserService', UserService);
    
  UserService.$inject = ['Users', '$q', '$timeout', '$http'];    
    
  function UserService(Users, $q, $timeout, $http) {
    return {
      'login'  : login,
      'listAll': listAll,
      'getByID': getByID,
          'add': add,
       'update': update,
       'remove': remove
    };
    
    function login(username, password) {
      return $http
        .post('/tools/login', {
          'username': username,
          'password': password
        });
    }
    
    function listAll() {
      var defer = $q.defer();
      $timeout(function() {
        defer.resolve(Users);
      });
      return defer.promise;
    }
    
    function getByID(id) {
      console.log('UserService.getByID:' + id);
      for(var i in Users) {
        var u = Users[i];
        if(u.id == id) {
          return u;
        }
      }
      return null;
    }
    
    function add(user) {
      var lastId = Users.length > 0 ? Users[Users.length - 1].id : 0;
      user.id = ++lastId;
      Users.push(user);
    }
    
    function update(user) {
      for(var i in Users) {
        var u = Users[i];
        if(u.id == user.id) {
          u.name = user.name;
          return true;
        }
      }
      return false;
    }
    
    function remove(id) {
      for(var i in Users) {
        var u = Users[i];
        if(u.id == id) {
          Users.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  }
  
})();