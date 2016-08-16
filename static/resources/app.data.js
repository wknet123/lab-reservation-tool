(function() {
  
  'use strict';
  
  angular
    .module('lab.reservation.tool')
    .value('Status', [
      {
        'id': '1',
        'description': 'Reserve'
      },
      {
        'id': '2',
        'description': 'Release'
      }
    ])
  
})();