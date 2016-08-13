(function() {
  
  'use strict';
  
  angular
    .module('layout.reservation', [
      'components.reservations'
    ])
    .controller('ReservationController', ReservationController);
    
  ReservationController.$inject = [];
  
  function ReservationController() {
    var vm = this;
    vm.editMode = false;
  }
  
})();