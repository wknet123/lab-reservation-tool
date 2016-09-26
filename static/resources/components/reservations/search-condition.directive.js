(function() {
  'use strict';

  var app = angular
    .module('components.reservations')
    .directive('searchCondition', searchCondition);

  SearchConditionController.$inject = ['$log', '$scope', '$rootScope'];

  function SearchConditionController($log, $scope, $rootScope) {
    var vm = this;
    var index = vm.index;

    var c = vm.selectedConditions[index];

    vm.label = c.getLabel();
    vm.fieldName = c.getFieldName();
    vm.fieldValue = c.getFieldValue();
    vm.comparison = c.getComparison();
    vm.relationOp = c.getRelationOp();

    vm.displayMode = 'INPUT';

    var mapping_config = [
      'group', 'location', 'vendor', 'cpu_vendor', 'cpu_model_name', 'model',
      'memory', 'hba_driver', 'nic_driver'
    ];

    if(mapping_config.indexOf(vm.fieldName) >= 0) {
      vm.displayMode = 'SELECT';
      var data = $rootScope[vm.fieldName] || [];
      vm.optionItems = [];
      for(var i in data) {
        vm.optionItems.push(data[i][vm.fieldName]);
      }
      if(vm.fieldValue === '' && data.length > 0) {
        vm.fieldValue = vm.optionItems[0];
      }
    }

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