(function() {
  
  'use strict';
  
  angular
    .module('components.machines')
    .directive('addOrUpdateMachine', addOrUpdateMachine);
    
  AddOrUpdateMachineController.$inject = [];
  
  function AddOrUpdateMachineController() {
    
  }
  
  addOrUpdateMachine.$inject = ['MachineService'];
  
  function addOrUpdateMachine(MachineService) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/machines/add-or-update-machine.directive.html',
      'scope': {
        'targetType': '@',
        'showModal': '=',
        'machineId': '@'
      },
      'link': link,
      'controller': AddOrUpdateMachineController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
    
    function link(scope, element, attrs, ctrl) {
      element.find('#modalMachine').on('show.bs.modal', function() {
        switch(ctrl.targetType) {
        case 'ADD_NEW':
          ctrl.modalTitle = 'Add Machine';
          ctrl.machine = {};
          break;
        case 'EDIT':
          ctrl.modalTitle = 'Edit Machine';
          ctrl.machine = MachineService.getByID(ctrl.machineId);
          break;
        }
      });
      
      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalMachine').modal('show');
          ctrl.showModal = false;
        }
      });
      
      ctrl.addOrUpdateMachine = addOrUpdateMachine;
      
      function addOrUpdateMachine(machine) {
        switch(ctrl.targetType) {
        case 'ADD_NEW':
          MachineService.add(machine);
          break;
        case 'EDIT':
          MachineService.update(machine);
        }  
        element.find('#modalMachine').modal('hide');
      }
    }
  }
  
})();