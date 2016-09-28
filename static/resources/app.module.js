(function() {
  
  'use strict';
  
  angular
    .module('lab.reservation.tool', [
      'ngRoute',
      'ngSanitize',
      'ngCookies',
      'layout.index',
      'components.loading.progress'
    ])
    .run(['HostService', 'HbaService', 'NicService', '$log', '$rootScope',
      function(HostService, HbaService, NicService, $log, $rootScope) {
        var mapping_config = {
          'group': HostService,
          'location': HostService,
          'vendor': HostService,
          'cpu_vendor': HostService,
          'cpu_model_name': HostService,
          'model': HostService,
          'memory': HostService,
          'hba_driver': HbaService,
          'nic_driver': NicService
        };

        for(var m in mapping_config) {
          ;(function(m) {
            mapping_config[m].grouped(m)
              .then(
                function getGroupedSuccess(response) {
                  $rootScope[m] = response.data;
                },
                function getGroupedFailed(response) {
                  $log.error('Failed to get grouped hosts.');
                });
           })(m);
         }
      }]);
})();