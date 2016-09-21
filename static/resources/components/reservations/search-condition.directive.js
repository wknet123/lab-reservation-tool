(function() {
  'use strict';

  angular
    .module('components.reservations')
    .directive('searchCondition', searchCondition);

  SearchConditionController.$inject = ['$log', '$scope', 'HostService', 'HbaService', 'NicService'];

  function SearchConditionController($log, $scope, HostService, HbaService, NicService) {
    var vm = this;
    var index = vm.index;

    var c = vm.selectedConditions[index];

    vm.label = c.getLabel();
    vm.fieldName = c.getFieldName();
    vm.fieldValue = c.getFieldValue();
    vm.comparison = c.getComparison();
    vm.relationOp = c.getRelationOp();

    vm.displayMode = 'INPUT';

    var mapping_config = {
      'group': HostService,
      'location': HostService,
      'vendor': HostService,
      'cpu_vendor': HostService,
      'cpu_model_name': HostService,
      'model': HostService,
      'memory': HostService,
      'hba_driver': HbaService,
      'nic_driver': NicService
    };

    var service = mapping_config[vm.fieldName];

    if(service) {
      vm.displayMode = 'SELECT';
      service.grouped(vm.fieldName)
        .then(getGroupedHostSuccess, getGroupedHostFailed);
    }

    function getGroupedHostSuccess(response) {
      var data = response.data || [];
      vm.optionItems = [];
      for(var i in data) {
        vm.optionItems.push(data[i][vm.fieldName]);
      }

      if(vm.fieldValue === '' && data.length > 0) {
        vm.fieldValue = vm.optionItems[0];
      }
    }

    function getGroupedHostFailed(response) {
      $log.error('Failed to get grouped host items.')
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