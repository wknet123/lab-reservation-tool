(function() {
  
  'use strict';
  
  angular
    .module('layout.sign.in', [
      'components.users'
    ])
    .controller('SignInController', SignInController);
    
  SignInController.$inject = ['$location', 'UserService', '$log'];
  
  function SignInController($location, UserService, $log) {
    var vm = this;
    vm.signIn = signIn;
    
    function signIn() {
      console.log('username:' + vm.username);
      UserService.login(vm.username, vm.password)
      .then(LoginSuccess, LoginFailed);
    }
    
    function LoginSuccess(response) {
      $location.url('/reservation');
    }
    
    function LoginFailed(response) {
      alert('Login failed.');
    }
  }
  
})();