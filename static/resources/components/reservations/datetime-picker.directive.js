(function() {
  'use strict';

  angular
    .module('components.reservations')
    .directive('datetimePicker', datetimePicker);

  DatetimePickerController.$inject = ['$filter', 'dateLFilter'];

  function DatetimePickerController($filter, dateLFilter) {
    var vm = this;
  }

  datetimePicker.$inject = ['$filter', 'dateLFilter', '$log', '$compile'];

  function datetimePicker($filter, dateLFilter, $log, $compile) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/datetime-picker.directive.html',
      'scope': {
        'pickerId': '@',
        'selectedDatetime': '=',
        'customClass': '@'
      },
      'link': link,
      'controller': DatetimePickerController,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;

    function link(scope, element, attrs, ctrl) {
      element.find('div:first').attr('id', ctrl.pickerId);
      element.find('#' + ctrl.pickerId).datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        ignoreReadonly: true,
        showClose: true
	    });
	    element.find('#' + ctrl.pickerId).on('dp.change', function(e) {
	      scope.$apply(function() {
          ctrl.selectedDatetime = $filter('dateL')(e.date, 'YYYY-MM-DD HH:mm');
        });
      });
    }
  }
})();