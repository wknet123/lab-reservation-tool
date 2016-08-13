(function() {
  
  'use strict';
  
  angular
    .module('components.devices')
    .directive('listDevices', listDevices);
  
  ListDevicesController.$inject = [];
  
  function ListDevicesController() {
    
  }  
   
  listDevices.$inject = [];
  
  function listDevices() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/devices/list-devices.directive.html',
      'scope': true,
      'controller': ListDevicesController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
  }
  
})();