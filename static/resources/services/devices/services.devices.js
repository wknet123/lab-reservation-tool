(function() {
  
  'use strict';
  
  angular
    .module('services.devices', [])
    .factory('DeviceService', DeviceService);
  
  DeviceService.$inject = ['Devices', '$http', '$log'];
  
  function DeviceService(Devices, $http, $log) {
    return {
      'listAll': listAll,
      'getByID': getByID,
          'add': add,
       'update': update,
       'remove': remove,
       'getByMachine': getByMachine
    };
    
    function listAll() {
      
    }
        
    function getByID(id) {
      
    }
    
    function add(device) {
      
    }
    
    function update(id) {
      
    }
    
    function remove(id) {
      
    }
    
    function getByMachine(id) {
      return $http.get('/tools/devices/' + id);
    }
  }
  
})();