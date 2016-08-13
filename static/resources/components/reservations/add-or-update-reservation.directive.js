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
      $log.info(e.value);
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
  
  addOrUpdateReservation.$inject = ['Users', 'Machines', 'Status', 'ReservationService', 'MachineService', 'Reservations', '$filter', 'dateLFilter', '$cookies', '$log'];
  
  function addOrUpdateReservation(Users, Machines, Status, ReservationService, MachineService, Reservations, $filter, dateLFilter, $cookies, $log) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/add-or-update-reservation.directive.html',
      'scope': {
        'showModal':'=',
        'machineId': '@',
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

        MachineService.getByID(ctrl.machineId)
          .then(getMachineByIdSuccess, getMachineByIdFailed);

        function getMachineByIdSuccess(response) {
          ctrl.machine = response.data[0];
          ReservationService.getByMachine(ctrl.machineId)
            .then(getReservationByMachineSuccess, getReservationByMachineFailed);
        }

        function getMachineByIdFailed(response) {
          $log.error('Failed to get machine by id:' + angular.toJson(response));
        }

        function getReservationByMachineSuccess(response) {


          if(response.data.length > 0) {
            ctrl.reservation = response.data[0].fields;
            ctrl.reservation.id = response.data[0].pk;
            ctrl.reservation.reservation_start_time = $filter('dateL')(ctrl.reservation.reservation_start_time, 'YYYY-MM-DD 00:00');
            ctrl.reservation.reservation_end_time = $filter('dateL')(ctrl.reservation.reservation_end_time, 'YYYY-MM-DD 23:00');
          }else{
            var now = new Date();
            ctrl.reservation = {};
            ctrl.reservation.reservation_start_time = $filter('dateL')(now, 'YYYY-MM-DD 00:00');
            ctrl.reservation.reservation_end_time = $filter('dateL')(now, 'YYYY-MM-DD 23:00');
          }
          ctrl.reservation.timeRange = ctrl.reservation.reservation_start_time + ' - ' + ctrl.reservation.reservation_end_time;

          ctrl.reservation.username = $cookies.get('username');
          ctrl.reservation.machine_id = ctrl.machineId;
          ctrl.reservation.status = ctrl.status[0];
        }

        function getReservationByMachineFailed(response) {
          $log.error('Failed to get reservation by machine:' + angular.toJson(response));
        }

        ctrl.status = Status;

      });

      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalReservation').modal('show');
          ctrl.showModal = false;
        }
      });
      
      ctrl.addOrUpdateReservation = addOrUpdateReservation;
      
      function addOrUpdateReservation() {
        ReservationService.addOrUpdate(ctrl.reservation, ctrl.machineId)
        .then(addOrUpdateReservationSuccess, addOrUpdateReservationFailed);
      }

      function addOrUpdateReservationSuccess(response) {
        element.find('#modalReservation').modal('hide');
        ctrl.reload();
      }

      function addOrUpdateReservationFailed(response) {
        alert('Failed to add or update reservation.');
      }

      element.find('#fromDateTimePicker').datetimepicker({
        format: 'YYYY-MM-DD hh:mm',
				ignoreReadonly: true,
        showClose: true,
				showClear: true
		  });
      element.find('#toDateTimePicker').datetimepicker({
        format: 'YYYY-MM-DD hh:mm',
				ignoreReadonly: true,
        showClose: true,
				showClear: true
		  });
      
      element.find('#fromDateTimePicker').on('dp.change', function(e) {
        element.find('#toDateTimePicker').data('DateTimePicker').minDate(e.date);
        ctrl.pickUp({'key': 'reservation_start_time', 'value':  $filter('dateL')(e.date, 'YYYY-MM-DD hh:mm')});
      });
      
      element.find('#toDateTimePicker').on('dp.change', function(e) {
        element.find('#fromDateTimePicker').data('DateTimePicker').maxDate(e.date);
        ctrl.pickUp({'key': 'reservation_end_time', 'value': $filter('dateL')(e.date, 'YYYY-MM-DD hh:mm')});
      });
    }
  }
  
})();