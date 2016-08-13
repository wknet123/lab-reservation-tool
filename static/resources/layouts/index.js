(function() {
  
  'use strict';
  
  angular
    .module('layout.index', [
      'layout.sign.in',
      'layout.reservation',
      'components.modal.dialog'
    ])
    .controller('IndexController', IndexController);
    
  IndexController.$inject = ['$scope', '$timeout', '$log'];
  
  function IndexController($scope, $timeout, $log) {
    var vm = this;

    vm.action = function() {
      $scope.$broadcast('showDialog', false);
    };

    $scope.$on('modalTitle', function(e, val) {
      vm.modalTitle = val;
    });
    
    $scope.$on('modalMessage', function(e, val) {
      $log.info(val);
      vm.modalMessage = val;
    });
    
    $scope.$on('contentType', function(e, val) {
      vm.contentType = val;
    });
    
    $scope.$on('confirmOnly', function(e, val) {
      vm.confirmOnly = val;
    });
        
    $scope.$on('raiseInfo', function(e, val) {
      if(val) {
        $scope.$broadcast('showDialog', val);
      }
    });
    
    $scope.$on('raiseError', function(e, val) {
      if(val) {   
        vm.action = function() {
          $scope.$broadcast('showDialog', false);
        };
        vm.contentType = 'text/plain';
        vm.confirmOnly = true;  
        
        $timeout(function() {    
          $scope.$broadcast('showDialog', true);
        }, 350);
      }
    });
  }
  
})();