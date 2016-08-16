(function() {
  
  'use strict';
  
  angular
    .module('services.users', [])
    .factory('UserService', UserService);
    
  UserService.$inject = ['$q', '$timeout', '$http'];
    
  function UserService($q, $timeout, $http) {
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
      return false;
    }
    
    function getByID(id) {
      return false;
    }
    
    function add(user) {
      return false;
    }
    
    function update(user) {
      return false;
    }
    
    function remove(id) {
      return false;
    }
  }
  
})();