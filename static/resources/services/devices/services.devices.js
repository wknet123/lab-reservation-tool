(function() {
  
  'use strict';
  
  angular
    .module('services.devices', [])
    .factory('DeviceService', DeviceService);
  
  DeviceService.$inject = ['$http', '$log'];
  
  function DeviceService($http, $log) {
    return {
      'listAll': listAll,
      'getByID': getByID,
          'add': add,
       'update': update,
       'remove': remove,
       'getByMachine': getByMachine
    };
    
    function listAll() {
      return false;
    }
        
    function getByID(id) {
      return false;
    }
    
    function add(device) {
      return false;
    }
    
    function update(id) {
      return false;
    }
    
    function remove(id) {
      return false;
    }
    
    function getByMachine(id) {
      return $http.get('/tools/devices/' + id);
    }
  }
  
})();