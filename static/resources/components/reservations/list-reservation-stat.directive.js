(function() {
  'use strict';

  angular
    .module('components.reservations')
    .directive('listReservationStat', listReservationStat);

  ListReservationStatController.$inject = ['ReservationService', '$log'];

  function ListReservationStatController(ReservationService, $log) {
    var vm = this;
    vm.modalTitle = "Host Reservation Stat"
    vm.isReserved = true;
    vm.retrieve = retrieve;

    vm.retrieve();

    function retrieve() {
      ReservationService
        .getReservationStat((vm.isReserved ? 1 : 0), vm.startTime, vm.endTime)
        .then(getReservationStatSuccess, getReservationStatFailed);
    }



    function getReservationStatSuccess(response) {
      vm.reservationStat = response.data;
    }

    function getReservationStatFailed(response) {
      $log.error('Failed to get reservation stat.');
    }
  }

  listReservationStat.$inject = [];

  function listReservationStat() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/list-reservation-stat.directive.html',
      'scope': {
        'showModal': '=',
        'hostName': '='
      },
      'link': link,
      'controller': ListReservationStatController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;

    function link(scope, element, attrs, ctrl) {
      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalListReservationStat').modal('show');
          ctrl.showModal = false;
        }
      });


      ctrl.redirectToHost = redirectToHost;
      function redirectToHost(hostName) {
        ctrl.hostName = hostName;
        element.find('#modalListReservationStat').modal('hide');
      }
    }
  }

})();