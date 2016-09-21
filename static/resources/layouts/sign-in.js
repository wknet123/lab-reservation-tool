(function() {
  
  'use strict';
  
  angular
    .module('layout.sign.in', [
      'components.users'
    ])
    .controller('SignInController', SignInController);
    
  SignInController.$inject = ['$scope', '$location', 'UserService', '$log'];
  
  function SignInController($scope, $location, UserService, $log) {
    var vm = this;
    vm.signIn = signIn;
    vm.signInKeyPress = signInKeyPress;

    vm.signInTIP = false;
    function signIn() {
      vm.signInTIP = true;
      UserService.login(vm.username, vm.password)
        .then(LoginSuccess, LoginFailed);
    }

    function signInKeyPress($event) {
      var keyCode = $event.which || $event.keyCode;
      if(keyCode === 13) {
        vm.signIn();
      }
    }
    
    function LoginSuccess(response) {
      vm.signInTIP = false;
      $location.url('/reservation');
    }
    
    function LoginFailed(response) {
      vm.signInTIP = false;
      $scope.$emit('modalTitle', 'Failed to sign in');
      $scope.$emit('modalMessage', 'Please check your username or password.');
      $scope.$emit('raiseError', true);
    }
  }
  
})();