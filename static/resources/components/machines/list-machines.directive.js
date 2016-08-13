(function() {
  
  'use strict';
  
  angular
    .module('components.machines')
    .directive('listMachines', listMachines);
    
  ListMachinesController.$inject = ['MachineService'];
  
  function ListMachinesController(MachineService) {
    var vm = this;
    
    vm.retrieve = retrieve;
    
    vm.toAddMachine = toAddMachine;
    vm.toEditMachine = toEditMachine;
      
    vm.remove = remove;
    
    vm.retrieve();

    function toAddMachine() {
      vm.targetType = 'ADD_NEW';
      vm.showModal = true;
    }
    
    function toEditMachine(id) {
      vm.targetType = 'EDIT';
      vm.showModal = true;
      vm.machineId = id;
    }

    function retrieve() {
      MachineService.listAll()
        .then(function(data) {
          vm.machines = data;          
        });
    }
    function remove(id) {
      MachineService.remove(id);
    }

  }
  
  listMachines.$inject = [];
  
  function listMachines() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/resources/components/machines/list-machines.directive.html',
      'scope': true,
      'controller': ListMachinesController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
  }
  
})();