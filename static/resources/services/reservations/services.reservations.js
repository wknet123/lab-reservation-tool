(function() {
  
  'use strict';
  
  angular
    .module('services.reservations', [])
    .factory('ReservationService', ReservationService);
  
  ReservationService.$inject = ['$q', '$timeout', '$http'];
  
  function ReservationService($q, $timeout, $http) {
    return {
          'add': add,
       'update': update,
       'remove': remove,
      'listAll': listAll,
 'getReservationByID': getReservationByID
    };

    function add(reservation, hostId, userId) {
      return $http.post('/tools/reservations/host/' + hostId + '/user/' + userId, {
        'reservation_start_time': reservation.reservation_start_time,
        'reservation_end_time': reservation.reservation_end_time
      });
    }
    
    function update(reservation, hostId, userId) {
      return $http.put('/tools/reservations/host/' + hostId + '/user/' + userId, {
        'reservation_id': reservation.id,
        'reservation_start_time': reservation.reservation_start_time,
        'reservation_end_time': reservation.reservation_end_time
      });
    }
    

    function remove(reservation, userId) {
      return $http.delete('/tools/reservations/' + reservation.id + '/user/' + userId);
    }
    
    function listAll(hostId) {
      return $http.get('/tools/reservations/host/' + hostId);
    }

    function getReservationByID(reservationId, userId) {
      return $http.get('/tools/reservations/' + reservationId + '/user/' + userId);
    }
  }
  
})();