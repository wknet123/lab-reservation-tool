(function() {
  
  'use strict';
  
  angular
    .module('components.hosts')
    .directive('listHosts', listHosts);
    
  ListHostsController.$inject = ['HostService'];
  
  function ListHostsController(HostService) {
    var vm = this;
    
    vm.retrieve = retrieve;
    
    vm.toAddHost = toAddHost;
    vm.toEditHost = toEditHost;
      
    vm.remove = remove;
    
    vm.retrieve();

    function toAddHost() {
      vm.targetType = 'ADD_NEW';
      vm.showModal = true;
    }
    
    function toEditHost(id) {
      vm.targetType = 'EDIT';
      vm.showModal = true;
      vm.hostId = id;
    }

    function retrieve() {
      HostService.listAll()
        .then(function(data) {
          vm.hosts = data;
        });
    }
    function remove(id) {
      HostService.remove(id);
    }

  }
  
  listHosts.$inject = [];
  
  function listHosts() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/resources/components/hosts/list-hosts.directive.html',
      'scope': true,
      'controller': ListHostsController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
  }
  
})();