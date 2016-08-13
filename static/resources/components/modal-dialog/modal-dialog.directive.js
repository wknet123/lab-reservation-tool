(function() {
  
  'use strict';
  
  angular
    .module('components.modal.dialog')
    .directive('modalDialog', modalDialog);
    
  ModalDialogController.$inject = [];
  
  function ModalDialogController() {
    
  }
  
  modalDialog.$inject = [];
  
  function modalDialog() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/modal-dialog/modal-dialog.directive.html',
      'scope': {
        'contentType': '@',
        'modalTitle': '@',
        'modalMessage': '@',
        'action': '&',
        'confirmOnly': '='       
      },
      'link': link,
      'controller': ModalDialogController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;
    
    function link(scope, element, attrs, ctrl) {
      scope.$watch('contentType', function(current) {
        if(current) {
          ctrl.contentType = current;  
        }
      });
      scope.$watch('confirmOnly', function(current) {
        if(current) {
          ctrl.confirmOnly = current;
        }
      });
                        
      scope.$watch('vm.modalMessage', function(current) {
        if(current) {
          switch(ctrl.contentType) {
          case 'text/html':
            element.find('.modal-body').html(current); break;
          case 'text/plain':
            element.find('.modal-body').text(current); break;
          default:
            element.find('.modal-body').text(current); break;
          }
        }
      });
      
      scope.$on('showDialog', function(e, val) {
         console.log('received showDialog:' + val);
        if(val) {
          element.find('#myModal').modal('show');
        }else{
          element.find('#myModal').modal('hide');
        }
      });
        
      element.find('#btnOk').on('click', clickHandler);        

      function clickHandler(e) {
        ctrl.action();  
      }
    }
  }
  
})();