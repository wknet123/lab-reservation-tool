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
    vm.getReservations = getReservations;
    vm.searchMachine = searchMachine;

    vm.retrieve('');

    function toAddOrUpdateReservation(reservationId, targetType) {
      vm.targetType = targetType;
      vm.machineId = vm.selectedMachine.pk;
      vm.machineName = vm.selectedMachine.fields.machine_name;

      vm.userId = $cookies.get('user_id');
      vm.username = $cookies.get('username');

      if(vm.targetType === 'EDIT') {
        vm.reservationId = reservationId;
      }

      vm.showModal = true;
    }

    function retrieve(machineName) {
      MachineService.listAll(machineName)
        .then(listMachineSuccess, listMachineFailed);
    }

    function searchMachine(machineName) {
      vm.retrieve(machineName);
    }

    function listMachineSuccess(response) {
      vm.machines = response.data;
      if (vm.machines && vm.machines.length > 0) {
        vm.selectedMachine = vm.machines[0];
        vm.getReservations();
      }else{
        vm.selectedMachine = null;
        vm.reservations = [];
      }
    }

    function listMachineFailed(response) {
      $log.error('Failed to list machines:' + angular.toJson(response));
    }

    function getMachineDevice(id) {
      DeviceService.getByMachine(id)
        .then(getDeviceByMachineSuccess, getDeviceByMachineFailed);
    }

    function getReservations() {
      if(vm.selectedMachine) {
        ReservationService.listAll(vm.selectedMachine.pk)
          .then(getReservationsByMachineSuccess, getReservationsByMachineFailed);
      }
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
      'link': link,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;

    function link(scope, element, attrs, ctrl) {

      ctrl.selectMachine = selectMachine;
      ctrl.postSelection = postSelection;

      ctrl.postSelection();

      element.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr('aria-controls');
        switch(target) {
        case 'systeminfo':
          break;
        case 'nic':
          break;
        case 'hba':
          break;
        case 'reservations':
          ctrl.getReservations();
          break;
        }
      });

      element.find('#myTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        scope.$apply();
      });

      function selectMachine(m) {
        ctrl.selectedMachine = m;
        ctrl.postSelection();
      }

      function postSelection() {
        element.find('#myTabs a:first').tab('show');
      }
    }
  }
  
})();