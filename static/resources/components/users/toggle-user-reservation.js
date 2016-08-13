(function() {
  
  'use strict';
  
  angular
    .module('components.users')
    .directive('toggleUserReservation', toggleUserReservation);
   
  ToggleUserReservationController.$inject = ['$scope', 'UserService'];
  
  function ToggleUserReservationController($scope, UserService) {
    var vm = this;
    
    vm.getUserByID = getUserByID;
    vm.retrieveUsers = retrieveUsers;
    
    
    vm.getUserByID(vm.userId);    
    
    
    $scope.$watch('vm.editMode', function(current) {
      if(current) { 
        vm.retrieveUsers();
      }
    });
    
    function retrieveUsers() {
      UserService.listAll()
        .then(function(data) {
          vm.users = data;    
        });
    }
    
    function getUserByID(id) {
      if(angular.isDefined(id)) {
        var user = UserService.getByID(id);
        vm.selectedUser = user;
      }else{
        vm.selectedUser = '-';
      }
    }
  }
  
  toggleUserReservation.$inject = [];
  
  function toggleUserReservation() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/users/toggle-user-reservation.html',
      'scope': {
        'userId': '@',
        'editMode': '='
      },
      'link': link,
      'controller': ToggleUserReservationController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
    
    function link(scope, element, attrs, ctrl) {
      
    }
  }
  
})();