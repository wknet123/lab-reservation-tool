(function() {
  
  'use strict';
  
  angular
    .module('components.users')
    .directive('addOrUpdateUser', addOrUpdateUser);
    
  AddOrUpdateUserController.$inject = [];
  
  function AddOrUpdateUserController() {           
    var vm = this;
  }
  
  addOrUpdateUser.$inject = ['UserService'];
  
  function addOrUpdateUser(UserService) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/users/add-or-update-user.directive.html',
      'scope': {
        'targetType': '@',
        'showModal': '=',
        'userId': '@'
      },
      'link': link,
      'controller': AddOrUpdateUserController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
    
    function link(scope, element, attrs, ctrl) {
      
      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalUser').modal('show'); 
          ctrl.showModal = false;
        }
      });
      
      element.find('#modalUser').on('show.bs.modal', function() {        
        switch(ctrl.targetType) {
        case 'ADD_NEW':
          ctrl.modalTitle = 'Add User'; 
          ctrl.user = {};
          break;
        case 'EDIT':
          ctrl.modalTitle = 'Edit User';
          ctrl.user = UserService.getByID(ctrl.userId);
          console.log('Edit User:' + angular.toJson(ctrl.user));
          break;
        }
      });
      
      
      ctrl.addOrUpdateUser = addOrUpdateUser;
      
      function addOrUpdateUser(user) {
        console.log(user);
        switch(ctrl.targetType) {
        case 'ADD_NEW':
          UserService.add(user);
          break;
        case 'EDIT':
          var u = UserService.getByID(user.id);
          UserService.update(u);
        }
        element.find('#modalUser').modal('hide');
      }
      
    }
  }
  
})();