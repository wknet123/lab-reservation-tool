(function() {
  
  'use strict';
  
  angular
    .module('services.machines', [])
    .factory('MachineService', MachineService);
  
  MachineService.$inject = ['$q', '$timeout', '$http'];
  
  function MachineService($q, $timeout, $http) {
    return {
      'listAll': listAll,
      'getByID': getByID,
          'add': add,
       'update': update,
       'remove': remove
    };
    
    function listAll() {
      return $http.get('/tools/machines');
    }
    
    function getByID(id) {
      return $http.get('/tools/machines/' + id);
    }
    
    function add(machine) {
      return false;
    }
    
    function update(machine) {
      return false;
    }
    
    function remove(id) {
      return false;
    }
  }
  
})();