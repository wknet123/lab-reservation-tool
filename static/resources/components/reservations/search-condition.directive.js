(function() {
  'use strict';

  angular
    .module('components.reservations')
    .directive('searchCondition', searchCondition);

  SearchConditionController.$inject = ['$log', '$scope'];

  function SearchConditionController($log, $scope) {
    var vm = this;
    var index = vm.index;

    var c = vm.selectedConditions[index];

    vm.label = c.getLabel();
    vm.fieldValue = c.getFieldValue();
    vm.comparison = c.getComparison();
    vm.relationOp = c.getRelationOp();

    $scope.$watch('vm.label', function(current) {
      if(current) {
        c.setLabel(current);
        vm.selectedConditions[index] = c;
      }
    });

    $scope.$watch('vm.comparison', function(current) {
      if(current) {
        c.setComparison(current);
        vm.selectedConditions[index] = c;
      }
    });

    $scope.$watch('vm.fieldValue', function(current) {
      if(current) {
        c.setFieldValue(current);
        vm.selectedConditions[index] = c;
      }
    });

    $scope.$watch('vm.relationOp', function(current) {
      if(current) {
        c.setRelationOp(current);
        vm.selectedConditions[index] = c;
      }
    });
  }

  searchCondition.$inject = [];

  function searchCondition() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/search-condition.directive.html',
      'scope': {
        'selectedConditions': '=',
        'index' : '@',
        'remove': '&'
      },
      'controllerAs': 'vm',
      'controller': SearchConditionController,
      'bindToController': true,
    };
    return directive;
  }

})();