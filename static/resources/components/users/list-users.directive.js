(function() {
  
  'use strict';
  
  angular
    .module('components.users')
    .directive('listUsers', listUsers);
    
  ListUsersController.$inject = ['$scope', 'UserService'];
  
  function ListUsersController($scope, UserService) {
    var vm = this;
    
    vm.retrieve = retrieve;
    
    vm.currentUser = {};
    
    vm.toAddUser = toAddUser;   
    vm.toEditUser = toEditUser;
    
    vm.remove = remove;
    
    vm.retrieve();
    
    function retrieve() {
      UserService.listAll()
        .then(function(data) {
          vm.users = data;
        });
    }
        
    function toAddUser() {
      vm.targetType = 'ADD_NEW';
      vm.showModal = true;
    }
    
    function toEditUser(id) {
      vm.targetType = 'EDIT';
      vm.userId = id;
      vm.showModal = true;      
    }
    
    function remove(id) {
      UserService.remove(id);
    }
  }
  
  listUsers.$inject = [];
  
  function listUsers() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/users/list-users.directive.html',
      'scope': true,
      'controller': ListUsersController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
  }
  
})();