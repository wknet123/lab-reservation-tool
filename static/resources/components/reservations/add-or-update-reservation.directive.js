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
    }
  }
  
  addOrUpdateReservation.$inject = ['Status', 'ReservationService', 'MachineService', '$filter', 'dateLFilter', '$cookies', '$log'];
  
  function addOrUpdateReservation(Status, ReservationService, MachineService, $filter, dateLFilter, $cookies, $log) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/add-or-update-reservation.directive.html',
      'scope': {
        'showModal':'=',
        'username': '@',
        'machineName': '@',
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

        ctrl.modalTitle = 'Edit Reservation';

        ReservationService.getByMachine(ctrl.machineId, ctrl.userId)
            .then(getReservationByMachineSuccess, getReservationByMachineFailed);
      });

      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalReservation').modal('show');
          ctrl.showModal = false;
        }
      });
      
      ctrl.addOrUpdateReservation = addOrUpdateReservation;

      function getReservationByMachineSuccess(response) {

        ctrl.reservation = {};
        ctrl.reservation.machineId = ctrl.machineId
        ctrl.reservation.userId = ctrl.userId
        ctrl.reservation.username = ctrl.username
        ctrl.status = Status;

        if(response.data.length > 0) {
          ctrl.reservation = response.data[0].fields;
          ctrl.reservation.id = response.data[0].pk;
          ctrl.reservation.machineId = ctrl.reservation.machine;
          ctrl.reservation.reservation_start_time = $filter('dateL')(ctrl.reservation.reservation_start_time, 'YYYY-MM-DD HH:mm');
          ctrl.reservation.reservation_end_time = $filter('dateL')(ctrl.reservation.reservation_end_time, 'YYYY-MM-DD HH:mm');
        }else{
          var now = new Date();
          ctrl.reservation.reservation_start_time = $filter('dateL')(now, 'YYYY-MM-DD 00:00');
          ctrl.reservation.reservation_end_time = $filter('dateL')(now, 'YYYY-MM-DD 23:00');
        }

        ctrl.reservation.timeRange = ctrl.reservation.reservation_start_time + ' - ' + ctrl.reservation.reservation_end_time;
        ctrl.reservation.status = ctrl.status[0];
      }

      function getReservationByMachineFailed(response) {
        $log.error('Failed to get reservation by machine:' + angular.toJson(response));
      }

      function addOrUpdateReservation() {
        switch(ctrl.reservation.status.id) {
        case '1':
          ReservationService.addOrUpdate(ctrl.reservation, ctrl.machineId, ctrl.userId)
            .then(manipulateReservationSuccess, manipulateReservationFailed);
          break;
        case '2':
          ReservationService.remove(ctrl.machineId, ctrl.userId)
            .then(manipulateReservationSuccess, manipulateReservationFailed);
          break;
        }
      }

      function manipulateReservationSuccess(response) {
        element.find('#modalReservation').modal('hide');
        ctrl.reload();
      }

      function manipulateReservationFailed(response) {
        element.find('#modalReservation').modal('hide');
        switch(ctrl.reservation.status.id) {
        case '1':
          scope.$emit('modalTitle', 'Failed to create reservation');
          scope.$emit('modalMessage', 'Can not reserved the machine, since it has been reserved by others.');
          break;
        case '2':
          scope.$emit('modalTitle', 'Failed to create reservation');
          scope.$emit('modalMessage', 'Can not release the machine, since you are not the reserved user currently.');
          break;
        }
        scope.$emit('raiseError', true);
      }

      element.find('#fromDateTimePicker').datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        ignoreReadonly: true,
        showClose: true,
		showClear: true
	  });

      element.find('#toDateTimePicker').datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
		ignoreReadonly: true,
        showClose: true,
	    showClear: true
	  });
      
      element.find('#fromDateTimePicker').on('dp.change', function(e) {
        element.find('#toDateTimePicker').data('DateTimePicker').minDate(e.date);
        ctrl.pickUp({'key': 'reservation_start_time', 'value':  $filter('dateL')(e.date, 'YYYY-MM-DD HH:mm')});
      });
      
      element.find('#toDateTimePicker').on('dp.change', function(e) {
        element.find('#fromDateTimePicker').data('DateTimePicker').maxDate(e.date);
        ctrl.pickUp({'key': 'reservation_end_time', 'value': $filter('dateL')(e.date, 'YYYY-MM-DD HH:mm')});
      });
    }
  }
  
})();