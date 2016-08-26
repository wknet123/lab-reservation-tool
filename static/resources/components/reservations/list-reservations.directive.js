(function() {
  
  'use strict';
  
  angular
    .module('components.reservations')
    .directive('listReservations', listReservations);
    
  ListReservationsController.$inject = ['$scope', 'MachineService', 'ReservationService', 'DeviceService', '$log', '$cookies'];
  
  function ListReservationsController($scope, MachineService, ReservationService, DeviceService, $log, $cookies) {
    var vm = this;

    vm.toAddOrUpdateReservation = toAddOrUpdateReservation;
    vm.retrieve = retrieve;
    vm.loginUsername = $cookies.get('username');
    vm.selectMachine = selectMachine;
    vm.getReservations = getReservations;

    vm.retrieve();

    function toAddOrUpdateReservation(reservationId, targetType) {
      vm.targetType = targetType;
      vm.machineId = vm.selectedMachine.pk;
      vm.machineName = vm.selectedMachine.fields.machine_name;

      vm.userId = $cookies.get('user_id');
      vm.username = $cookies.get('username');

      if(vm.targetType === 'EDIT') {
        $log.debug('reservationId:' + reservationId);
        ReservationService.getReservationByID(reservationId, vm.userId)
          .then(getReservationByIDSuccess, getReservationByIDFailed);
      }else{
        vm.showModal = true;
      }
    }
    
    function retrieve() {
      MachineService.listAll()
        .then(listMachineSuccess, listMachineFailed);
    }

    function listMachineSuccess(response) {
      vm.machines = response.data;
      vm.selectedMachine = vm.machines[0];
      vm.getReservations();
    }

    function listMachineFailed(response) {
      $log.error('Failed to list machines:' + angular.toJson(response));
    }

    function selectMachine(m) {
      vm.selectedMachine = m;
      vm.getReservations();
    }

    function getMachineDevice(id) {
      DeviceService.getByMachine(id)
        .then(getDeviceByMachineSuccess, getDeviceByMachineFailed);
    }
    

    function getReservations() {
      ReservationService.listAll(vm.selectedMachine.pk)
        .then(getReservationsByMachineSuccess, getReservationsByMachineFailed);
    }

    function getReservationByIDSuccess(response) {
      var reservation = response.data[0];
      vm.reservationId = reservation.pk;
      vm.userId = reservation.fields.user;
      vm.username = reservation.fields.username;
      vm.showModal = true;
    }

    function getReservationByIDFailed(response) {
      $log.error('No reservation exist.');
    }

    function getReservationsByMachineSuccess(response) {
      vm.reservations = response.data;
    }

    function getReservationsByMachineFailed(response) {
      $log.error('No reservations exist.');
    }

  }
  
  listReservations.$inject = [];
  
  function listReservations() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/list-reservations.directive.html',
      'scope': true,
      'controller': ListReservationsController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;    
  }
  
})();