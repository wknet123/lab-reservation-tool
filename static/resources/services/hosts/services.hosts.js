(function() {
  
  'use strict';
  
  angular
    .module('services.hosts', [])
    .factory('HostService', HostService);
  
  HostService.$inject = ['$q', '$timeout', '$http'];
  
  function HostService($q, $timeout, $http) {
    return {
      'listAll': listAll,
      'getByID': getByID,
          'add': add,
       'update': update,
       'remove': remove
    };
    
    function listAll(hostName) {
      return $http.get('/tools/hosts', {
        'params': {
          'host_name': hostName
        }
      });
    }
    
    function getByID(id) {
      return $http.get('/tools/host/' + id);
    }
    
    function add(host) {
      return false;
    }
    
    function update(host) {
      return false;
    }
    
    function remove(id) {
      return false;
    }
  }
  
})();