(function() {
  
  'use strict';
  
  angular
    .module('services.reservations', [])
    .factory('ReservationService', ReservationService);
  
  ReservationService.$inject = ['$q', '$timeout', '$http'];
  
  function ReservationService($q, $timeout, $http) {
    return {
  'addOrUpdate': addOrUpdate,
       'remove': remove,
      'listAll': listAll,
 'getByMachine': getByMachine
    };

    function addOrUpdate(reservation, machineId, userId) {
      if(reservation.id) {
        return update(reservation, machineId, userId);
      }
      return add(reservation, machineId, userId);
    }

    function add(reservation, machineId, userId) {
      return $http.post('/tools/reservations/machine/' + machineId + '/user/' + userId, {
        'reservation_start_time': reservation.reservation_start_time,
        'reservation_end_time': reservation.reservation_end_time
      });
    }
    
    function update(reservation, machineId, userId) {
      return $http.put('/tools/reservations/machine/' + machineId + '/user/' + userId, {
        'reservation_start_time': reservation.reservation_start_time,
        'reservation_end_time': reservation.reservation_end_time
      });
    }
    

    function remove(machineId, userId) {
      return $http.delete('/tools/reservations/machine/' + machineId + '/user/' + userId);
    }
    
    function listAll() {
      return $http.get('/tools/reservations/user');
    }

    function getByMachine(machineId, userId) {
      return $http.get('/tools/reservations/machine/' + machineId + '/user/' + userId);
    }
  }
  
})();