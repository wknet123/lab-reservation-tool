(function() {
  
  'use strict';
  
  angular
    .module('components.hosts')
    .directive('addOrUpdateHost', addOrUpdateHost);
    
  AddOrUpdateHostController.$inject = [];
  
  function AddOrUpdateHostController() {
    
  }
  
  addOrUpdateHost.$inject = ['HostService'];
  
  function addOrUpdateHost(HostService) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/hosts/add-or-update-host.directive.html',
      'scope': {
        'targetType': '@',
        'showModal': '=',
        'hostId': '@'
      },
      'link': link,
      'controller': AddOrUpdateHostController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
    
    function link(scope, element, attrs, ctrl) {
      element.find('#modalHost').on('show.bs.modal', function() {
        switch(ctrl.targetType) {
        case 'ADD_NEW':
          ctrl.modalTitle = 'Add Host';
          ctrl.host = {};
          break;
        case 'EDIT':
          ctrl.modalTitle = 'Edit Host';
          ctrl.host = HostService.getByID(ctrl.hostId);
          break;
        }
      });
      
      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalHost').modal('show');
          ctrl.showModal = false;
        }
      });
      
      ctrl.addOrUpdateHost = addOrUpdateHost;
      
      function addOrUpdateHost(host) {
        switch(ctrl.targetType) {
        case 'ADD_NEW':
          HostService.add(host);
          break;
        case 'EDIT':
          HostService.update(host);
        }  
        element.find('#modalHost').modal('hide');
      }
    }
  }
  
})();