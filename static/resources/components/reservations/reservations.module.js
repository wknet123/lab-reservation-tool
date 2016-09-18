(function() {
  
  'use strict';
  
  angular
    .module('components.reservations', [
      'services.reservations',
      'services.profiles',
      'services.hosts',
      'services.nics',
      'services.hbas'
    ]);
  
})();