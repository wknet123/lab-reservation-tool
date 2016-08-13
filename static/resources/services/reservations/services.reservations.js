(function() {
  
  'use strict';
  
  angular
    .module('services.reservations', [])
    .factory('ReservationService', ReservationService);
  
  ReservationService.$inject = ['Reservations', '$q', '$timeout', '$http'];
  
  function ReservationService(Reservations, $q, $timeout, $http) {
    return {
  'addOrUpdate': addOrUpdate,
       'remove': remove,
      'listAll': listAll,
 'getByMachine': getByMachine
    };

    function addOrUpdate(reservation, machineId) {
      if(reservation.id) {
        return update(reservation, machineId);
      }
      return add(reservation, machineId);
    }

    function add(reservation, machineId) {
      return $http.post('/tools/reservations/' + machineId, {
        'reservation_start_time': reservation.reservation_start_time,
        'reservation_end_time': reservation.reservation_end_time,
        'machine_id': reservation.machine_id
      });
    }
    
    function update(reservation, machineId) {
      return $http.put('/tools/reservations/' + machineId, {
        'reservation_start_time': reservation.reservation_start_time,
        'reservation_end_time': reservation.reservation_end_time,
        'machine_id': reservation.machine_id
      });
    }
    

    function remove(id) {
      for(var i in Reservations) {
        var r = Reservations[i];
        if(r.id == id) {
          Reservations.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    
    function listAll() {
      return $http.get('/tools/reservations/user');
    }

    function getByMachine(machineId) {
      return $http.get('/tools/reservations/machine/' + machineId);
    }
  }
  
})();