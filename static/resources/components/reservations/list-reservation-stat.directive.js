(function() {
  'use strict';

  angular
    .module('components.reservations')
    .directive('listReservationStat', listReservationStat);

  ListReservationStatController.$inject = ['$log'];

  function ListReservationStatController($log) {
    var vm = this;
    vm.modalTitle = "Host Reservation Stat"
    vm.isReserved = true;
  }

  listReservationStat.$inject = ['ReservationService', '$log'];

  function listReservationStat(ReservationService, $log) {
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
      element.find('#modalListReservationStat').on('show.bs.modal', function() {

        ctrl.retrieve = retrieve;
        ctrl.redirectToHost = redirectToHost;
        ctrl.changeTimespan = changeTimespan;

        ctrl.timeSpanFilter = {'key': 10, 'value': ''};
        ctrl.changeTimespan();
        ctrl.retrieve();
      });

      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalListReservationStat').modal('show');
          ctrl.showModal = false;
        }
      });

      function retrieve() {
        ReservationService
          .getReservationStat((ctrl.isReserved ? 1 : 0), ctrl.startTime, ctrl.endTime, ctrl.timeSpanFilter.key)
          .then(getReservationStatSuccess, getReservationStatFailed);
      }

      function getReservationStatSuccess(response) {
        ctrl.reservationStat = response.data;
      }

      function getReservationStatFailed(response) {
        $log.error('Failed to get reservation stat.');
      }

      function changeTimespan() {
        var now = new Date();
        ctrl.endTime = moment(now).format('YYYY-MM-DD 23:59');
        ctrl.startTime = moment(now).add(-ctrl.timeSpanFilter.key, 'days').format('YYYY-MM-DD 00:00');
      }

      function redirectToHost(hostName) {
        ctrl.hostName = hostName;
        element.find('#modalListReservationStat').modal('hide');
        ctrl.showModal = false;
      }
    }
  }

})();