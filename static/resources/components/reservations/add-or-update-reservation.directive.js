(function() {
  
  'use strict';
  
  angular
    .module('components.reservations')
    .directive('addOrUpdateReservation', addOrUpdateReservation);
    
  AddOrUpdateReservationController.$inject = ['$scope', '$log'];
  
  function AddOrUpdateReservationController($scope, $log) {
    var vm = this;

  }
  
  addOrUpdateReservation.$inject = ['Status', 'ReservationService', 'HostService', '$filter', 'dateLFilter', '$cookies', '$log'];
  
  function addOrUpdateReservation(Status, ReservationService, HostService, $filter, dateLFilter, $cookies, $log) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/add-or-update-reservation.directive.html',
      'scope': {
        'targetType': '@',
        'showModal':'=',
        'username': '@',
        'hostName': '@',
        'reservationId': '@',
        'hostId': '@',
        'userId': '@',
        'reload': '&'
      },
      'link': link,
      'controller': AddOrUpdateReservationController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
    
    function link(scope, element, attrs, ctrl) {
      element.find('#modalReservation').on('show.bs.modal', function() {

        ctrl.reservation = {};
        ctrl.reservation.hostId = ctrl.hostId
        ctrl.reservation.userId = ctrl.userId
        ctrl.reservation.username = ctrl.username
        ctrl.status = Status;

        var now = new Date();
        ctrl.reservation.reservation_start_time = $filter('dateL')(now, 'YYYY-MM-DD 00:00');
        ctrl.reservation.reservation_end_time = $filter('dateL')(now, 'YYYY-MM-DD 23:00');
        ctrl.reservation.timeRange = ctrl.reservation.reservation_start_time + ' - ' + ctrl.reservation.reservation_end_time;

        switch(ctrl.targetType) {
        case 'ADD':
          ctrl.modalTitle = 'Add Reservation';
          ctrl.reservation.status = ctrl.status[0];
          break;
        case 'EDIT':
          ctrl.modalTitle = 'Edit Reservation';
          ReservationService.getReservationByID(ctrl.reservationId, ctrl.userId)
            .then(getReservationByIDSuccess, getReservationByIDFailed);
          break;
        }

      });

      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalReservation').modal('show');
          ctrl.showModal = false;
        }
      });

      ctrl.addOrUpdateReservation = addOrUpdateReservation;

      function getReservationByIDSuccess(response) {
        if(response.data.length > 0) {
          ctrl.reservation = response.data[0].fields;
          ctrl.reservation.id = response.data[0].pk;
          ctrl.reservation.hostId = ctrl.reservation.host;
          ctrl.reservation.reservation_start_time = $filter('dateL')(ctrl.reservation.reservation_start_time, 'YYYY-MM-DD HH:mm');
          ctrl.reservation.reservation_end_time = $filter('dateL')(ctrl.reservation.reservation_end_time, 'YYYY-MM-DD HH:mm');
          ctrl.reservation.timeRange = ctrl.reservation.reservation_start_time + ' - ' + ctrl.reservation.reservation_end_time;
          ctrl.reservation.status = ctrl.status[0];
        }
      }

      function getReservationByIDFailed(response) {
        $log.error('Failed to get reservation by host:' + angular.toJson(response));
      }

      function addOrUpdateReservation() {
        if((new Date(ctrl.reservation.reservation_end_time).getTime() - new Date(ctrl.reservation.reservation_start_time).getTime()) < 0) {
          element.find('#modalReservation').modal('hide');
          scope.$emit('modalTitle', 'Failed to create reservation');
          scope.$emit('modalMessage', 'Reservation end time can not be earlier than start time.');
          scope.$emit('raiseError', true);
          return;
        }
        if(ctrl.targetType === 'ADD') {
           ReservationService.add(ctrl.reservation, ctrl.hostId, ctrl.userId)
          .then(manipulateReservationSuccess, manipulateReservationFailed);
        } else if(ctrl.targetType === 'EDIT') {
          $log.debug('reservation status:' + ctrl.reservation.status.id);
          switch(ctrl.reservation.status.id) {
          case '1':
            ReservationService.update(ctrl.reservation, ctrl.hostId, ctrl.userId)
              .then(manipulateReservationSuccess, manipulateReservationFailed);
            break;
          case '2':
            ReservationService.remove(ctrl.reservation, ctrl.userId)
              .then(manipulateReservationSuccess, manipulateReservationFailed);
            break;
          }
        }
      }

      function manipulateReservationSuccess(response) {
        element.find('#modalReservation').modal('hide');
        ctrl.reload();
      }

      function manipulateReservationFailed(response) {
        element.find('#modalReservation').modal('hide');

        if(ctrl.targetType === 'ADD') {
          scope.$emit('modalTitle', 'Failed to create reservation');
          scope.$emit('modalMessage', 'Can not reserved the host, since it has been reserved at the same time.');
        }else if(ctrl.targetType === 'EDIT') {
          switch(ctrl.reservation.status.id) {
          case '1':
            scope.$emit('modalTitle', 'Failed to create reservation');
            scope.$emit('modalMessage', 'Can not reserved the host, since it has been reserved at the same time.');
            break;
          case '2':
            scope.$emit('modalTitle', 'Failed to create reservation');
            scope.$emit('modalMessage', 'Can not release the host, since you are not the reserved user currently.');
            break;
          }
        }
        scope.$emit('raiseError', true);
      }
    }
  }
  
})();