(function() {
  
  'use strict';
  
  angular
    .module('components.reservations')
    .directive('toggleEditReservation', toggleEditReservation);
    
  ToggleEditReservationController.$inject = [];
  
  function ToggleEditReservationController() {
    var vm = this;
    
    vm.toggleEditMode = toggleEditMode;
    
    function toggleEditMode() {
      if(vm.editMode) {
        vm.editMode = false;
      }else{
        vm.editMode = true;
      }
    }
  }
  
  toggleEditReservation.$inject = [];
  
  function toggleEditReservation() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/toggle-edit-reservation.html',
      'scope': {
        'editMode': '='
      },
      'controller': ToggleEditReservationController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
  }
  
})();