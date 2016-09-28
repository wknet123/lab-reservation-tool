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

    vm.timeSpanFilter = {'key': 10, 'value': ''};
    vm.changeTimespan = changeTimespan;

    vm.retrieve();
    vm.changeTimespan();

    function retrieve() {
      ReservationService
        .getReservationStat((vm.isReserved ? 1 : 0), vm.startTime, vm.endTime, vm.timeSpanFilter.key)
        .then(getReservationStatSuccess, getReservationStatFailed);
    }

    function getReservationStatSuccess(response) {
      vm.reservationStat = response.data;
    }

    function getReservationStatFailed(response) {
      $log.error('Failed to get reservation stat.');
    }

    function changeTimespan() {
      var now = new Date();
      vm.endTime = moment(now).format('YYYY-MM-DD 23:59');
      vm.startTime = moment(now).add(-vm.timeSpanFilter.key, 'days').format('YYYY-MM-DD 00:00');
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
        ctrl.showModal = false;
      }
    }
  }

})();