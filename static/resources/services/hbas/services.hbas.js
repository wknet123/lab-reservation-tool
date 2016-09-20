(function() {
  'use strict';

  angular
    .module('services.hbas', [])
    .service('HbaService', HbaService);

  HbaService.$inject = ['$http', '$log'];

  function HbaService($http, $log) {
    return {
      'getByHostName': getByHostName,
      'grouped': grouped
    };
    function getByHostName(hostName) {
      return $http.get('/tools/hbas', {
        'params': {
          'host_name': hostName
        }
      });
    }

    function grouped() {
      return $http.get('/tools/group/hbas');
    }
  }
})();