(function() {
  'use strict';

  angular
    .module('services.hbas', [])
    .service('HbaService', HbaService);

  HbaService.$inject = ['$http', '$log'];

  function HbaService($http, $log) {
    return {
      'getByHostName': getByHostName
    };
    function getByHostName(hostName) {
      return $http.get('/tools/hbas', {
        'params': {
          'host_name': hostName
        }
      });
    }
  }
})();