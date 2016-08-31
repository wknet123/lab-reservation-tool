(function() {
  
  'use strict';
  
  angular
    .module('services.nics', [])
    .factory('NicService', NicService);
  
  NicService.$inject = ['$http', '$log'];
  
  function NicService($http, $log) {
    return {
      'getByHostName': getByHostName
    };
    
    function getByHostName(hostName) {
      return $http.get('/tools/nics', {
        'params': {
          'host_name': hostName
        }
      });
    }
  }
  
})();