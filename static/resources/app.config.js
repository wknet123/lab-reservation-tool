(function() {
  
  'use strict';
  
  angular
    .module('lab.reservation.tool')
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/sign-in', {
          'controller': 'SignInController',
          'templateUrl': '/tools/static/resources/layouts/sign-in.htm',
          'controllerAs': 'vm'            
        })
        .when('/reservation', {
          'controller': 'ReservationController',
          'templateUrl': '/tools/static/resources/layouts/reservation.htm',
          'controllerAs': 'vm'
        })
        .otherwise({
          'redirectTo': '/sign-in'  
        });
    }])
    .config(['$interpolateProvider', function($interpolateProvider) {
      $interpolateProvider.startSymbol('//');
      $interpolateProvider.endSymbol('//');
    }])
    .filter('dateL', dateL);
    
  function dateL() {
    return function(input, pattern) {
      var d = new Date(input || '');
      if(d.getTime() <= 0) {return '-';}
      return moment(d).format(pattern);
    }
  }
  
})();