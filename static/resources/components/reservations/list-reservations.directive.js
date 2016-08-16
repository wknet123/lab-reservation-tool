(function() {
  
  'use strict';
  
  angular
    .module('components.reservations')
    .directive('listReservations', listReservations);
    
  ListReservationsController.$inject = ['$scope', 'MachineService', 'ReservationService', 'DeviceService', '$log', '$cookies'];
  
  function ListReservationsController($scope, MachineService, ReservationService, DeviceService, $log, $cookies) {
    var vm = this;
    
    vm.toEditReservation = toEditReservation;
    
    vm.remove = remove;
    
    vm.retrieve = retrieve;
    vm.loginUsername = $cookies.get('username');
    vm.getMachineDevice = getMachineDevice;
    vm.getConciseMachineInfo = getConciseMachineInfo;
    vm.getReservations = getReservations;
    vm.getReservationByMachine = getReservationByMachine;

    vm.retrieve();

    vm.getReservations();
        
    function toEditReservation(id, reservation, machineName) {
      vm.targetType = 'EDIT';
      vm.showModal = true;
      vm.machineId = id;
      vm.machineName = machineName;

      if(reservation && reservation.fields) {
        vm.userId = reservation.fields.user;
        vm.username = reservation.fields.username;
      }else{
        vm.userId = $cookies.get('user_id');
        vm.username = $cookies.get('username');
      }

    }
    
    function retrieve() {
      MachineService.listAll()
        .then(listMachineSuccess, listMachineFailed);
    }

    function listMachineSuccess(response) {
      vm.machines = response.data;
    }

    function listMachineFailed(response) {
      $log.error('Failed to list machines:' + angular.toJson(response));
    }
        
    function getMachineDevice(id) {
      DeviceService.getByMachine(id)
        .then(getDeviceByMachineSuccess, getDeviceByMachineFailed);
    }
    
    function getConciseMachineInfo(id) {
      return '-';
    }

    function getDeviceByMachineSuccess(response) {
      var device = response.data[0].fields;
      $scope.$emit('modalTitle', 'Machine Device Info');
      $scope.$emit('modalMessage', '<table class="table">' +
        '<tbody>' +
          '<tr><td>CPU</td><td>' + device.cpu + '</td></tr>' +
          '<tr><td>Memory<val/td><td>' + device.memory + '</td></tr>' +
          '<tr><td>HDD</td><td>' + device.hdd + '</td></tr>' +
          '<tr><td>NIC</td><td>' + device.nic + '</td></tr>' +
        '</tbody>' +
        '</table>');
      $scope.$emit('contentType', 'text/html');
      $scope.$emit('confirmOnly', true);
      $scope.$emit('raiseInfo', true);
    }

    function getDeviceByMachineFailed(response) {
      $log.error('Failed to get device by machine:' + angular.toJson(response));
    }

    function getReservations() {
      ReservationService.listAll()
        .then(getReservationByUserSuccess, getReservationByUserFailed);
    }

    function getReservationByMachine(machineId) {
      if(angular.isDefined(vm.reservations)) {
          for(var i in vm.reservations) {
            var r = vm.reservations[i];
            if(r.fields.machine == machineId) {
              return r;
            }
          }
          return null;
      }
    }

    function getReservationByUserSuccess(response) {
      vm.reservations = response.data;
    }

    function getReservationByUserFailed(response) {
      $log.error('No reservations exist.');
    }

    function remove(id) {
      ReservationService.remove(id);
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