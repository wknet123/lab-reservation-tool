(function() {
  
  'use strict';
  
  angular
    .module('components.reservations')
    .directive('addOrUpdateReservation', addOrUpdateReservation);
    
  AddOrUpdateReservationController.$inject = ['$scope', '$log'];
  
  function AddOrUpdateReservationController($scope, $log) {
    var vm = this;
    
    vm.pickUp = pickUp;
    
    function pickUp(e) {
      switch(e.key){
      case 'reservation_start_time':
        vm.reservation.reservation_start_time = e.value;
        break;
      case 'reservation_end_time':
        vm.reservation.reservation_end_time = e.value;
        break;
      }
      vm.reservation.timeRange = vm.reservation.reservation_start_time +  ' - ' + vm.reservation.reservation_end_time;
      $scope.$apply();

    }
  }
  
  addOrUpdateReservation.$inject = ['Status', 'ReservationService', 'MachineService', '$filter', 'dateLFilter', '$cookies', '$log'];
  
  function addOrUpdateReservation(Status, ReservationService, MachineService, $filter, dateLFilter, $cookies, $log) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/add-or-update-reservation.directive.html',
      'scope': {
        'targetType': '@',
        'showModal':'=',
        'username': '@',
        'machineName': '@',
        'reservationId': '@',
        'machineId': '@',
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
        ctrl.reservation.machineId = ctrl.machineId
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
          ctrl.reservation.machineId = ctrl.reservation.machine;
          ctrl.reservation.reservation_start_time = $filter('dateL')(ctrl.reservation.reservation_start_time, 'YYYY-MM-DD HH:mm');
          ctrl.reservation.reservation_end_time = $filter('dateL')(ctrl.reservation.reservation_end_time, 'YYYY-MM-DD HH:mm');
          ctrl.reservation.timeRange = ctrl.reservation.reservation_start_time + ' - ' + ctrl.reservation.reservation_end_time;
          ctrl.reservation.status = ctrl.status[0];
        }
      }

      function getReservationByIDFailed(response) {
        $log.error('Failed to get reservation by machine:' + angular.toJson(response));
      }

      function addOrUpdateReservation() {
//        if((new Date(ctrl.reservation.reservation_end_time).getTime() - new Date(ctrl.reservation.reservation_start_time).getTime()) < 0) {
//          element.find('#modalReservation').modal('hide');
//          scope.$emit('modalTitle', 'Failed to create reservation');
//          scope.$emit('modalMessage', 'Reservation end time can not be earlier than start time.');
//          scope.$emit('raiseError', true);
//          return;
//        }
        if(ctrl.targetType === 'ADD') {
           ReservationService.add(ctrl.reservation, ctrl.machineId, ctrl.userId)
          .then(manipulateReservationSuccess, manipulateReservationFailed);
        } else if(ctrl.targetType === 'EDIT') {
          $log.debug('reservation status:' + ctrl.reservation.status.id);
          switch(ctrl.reservation.status.id) {
          case '1':
            ReservationService.update(ctrl.reservation, ctrl.machineId, ctrl.userId)
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
          scope.$emit('modalMessage', 'Can not reserved the machine, since it has been reserved at the same time.');
        }else if(ctrl.targetType === 'EDIT') {
          switch(ctrl.reservation.status.id) {
          case '1':
            scope.$emit('modalTitle', 'Failed to create reservation');
            scope.$emit('modalMessage', 'Can not reserved the machine, since it has been reserved at the same time.');
            break;
          case '2':
            scope.$emit('modalTitle', 'Failed to create reservation');
            scope.$emit('modalMessage', 'Can not release the machine, since you are not the reserved user currently.');
            break;
          }
        }
        scope.$emit('raiseError', true);
      }

      element.find('#fromDateTimePicker').datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        ignoreReadonly: true,
        showClose: true
	    });

      element.find('#toDateTimePicker').datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
		    ignoreReadonly: true,
        showClose: true
	    });
      
      element.find('#fromDateTimePicker').on('dp.change', function(e) {
        ctrl.pickUp({'key': 'reservation_start_time', 'value':  $filter('dateL')(e.date, 'YYYY-MM-DD HH:mm')});
      });
      
      element.find('#toDateTimePicker').on('dp.change', function(e) {
        ctrl.pickUp({'key': 'reservation_end_time', 'value': $filter('dateL')(e.date, 'YYYY-MM-DD HH:mm')});
      });
    }
  }
  
})();