(function() {

  'use strict';

  angular
    .module('services.profiles', [])
    .service('ProfileService', ProfileService);

  ProfileService.$inject = ['$http', '$log'];

  function ProfileService($http, $log) {
    return {
      'get': get,
      'addOrUpdate': addOrUpdate
    };

    function get() {
      return $http.get('/tools/profiles');
    }

    function addOrUpdate(profile) {
      return $http.post('/tools/profiles', {
        'filter_option': profile.filterOption,
        'reservation_start_time': profile.reservationStartTime,
        'reservation_end_time': profile.reservationEndTime
      });
    }
  }

})();