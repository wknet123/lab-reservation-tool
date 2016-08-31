(function() {
  
  'use strict';
  
  angular
    .module('components.reservations', [
      'services.reservations',
      'services.hosts',
      'services.nics',
      'services.hbas'
    ]);
  
})();