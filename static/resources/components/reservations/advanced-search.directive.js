(function() {
  'use strict';

  angular
    .module('components.reservations')
    .value('filterOptions', filterOptions)
    .directive('advancedSearch', advancedSearch);
  function filterOptions() {
    var values = [
      {'name': 'vendor', 'label': 'Vendor', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'model' , 'label': 'Model' , 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'host_name',  'label': 'Host Name', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'cpu_vendor', 'label': 'CPU Vendor','group': {'name': 'host', 'label': 'Host'}},
      {'name': 'cpu_code_name', 'label': 'CPU Code Name', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'cpu_model',  'label': 'CPU Model', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'cpu_cores',  'label': 'CPU Cores', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'cpu_sockets','label': 'CPU Sockets', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'memory',  'label': 'Memory', 'group': {'name': 'host', 'label': 'Host'}},
      {'name': 'total_nics', 'label': 'Total NICs','group': {'name': 'host', 'label': 'Host'}},
      {'name': 'total_hbas', 'label': 'Total HBAs','group': {'name': 'host', 'label': 'Host'}},
      {'name': 'driver', 'label': 'Driver', 'group': {'name': 'nic', 'label': 'NIC'}},
      {'name': 'driver', 'label': 'Driver', 'group': {'name': 'hba', 'label': 'HBA'}}
    ];
    return values;
  }

  AdvancedSearchController.$inject = ['$scope', '$log', 'filterOptions'];

  function AdvancedSearchController($scope, $log, filterOptions) {
    var vm = this;
    vm.filterOptions = filterOptions();
  }

  advancedSearch.$inject = ['$log', '$compile'];

  function advancedSearch($log, $compile) {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/advanced-search.directive.html',
      'scope': {
        'showModal': '='
      },
      'controller': AdvancedSearchController,
      'link': link,
      'controllerAs': 'vm',
      'transclude': true,
      'bindToController': true
    };
    return directive;


    function link(scope, element, attrs, ctrl) {

      var Condition = function(label, fieldName, comparison, fieldValue, relationOp) {
        this.label = label;
        this.fieldName = fieldName;
        this.comparison = comparison;
        this.fieldValue = fieldValue;
        this.relationOp = relationOp;
      };

      Condition.prototype.setLabel = function(label) {
        this.label = label;
      }

      Condition.prototype.getLabel = function() {
        return this.label;
      }

      Condition.prototype.setFieldName = function(fieldName) {
        this.fieldName = fieldName;
      }

      Condition.prototype.getFieldName = function() {
        return this.fieldName;
      }

      Condition.prototype.setComparison = function(comparison) {
        this.comparison = comparison;
      }

      Condition.prototype.getComparison = function() {
        return this.comparison;
      }

      Condition.prototype.setFieldValue = function(fieldValue) {
        this.fieldValue = fieldValue;
      }

      Condition.prototype.getFieldValue = function() {
        return this.fieldValue;
      }

      Condition.prototype.setRelationOp = function(relationOp) {
        this.relationOp = relationOp;
      }

      Condition.prototype.getRelationOp = function() {
        return this.relationOp;
      }

      function createCondition(label, fieldName) {
        return new Condition(label, fieldName, '=', '', 'AND');
      }

      scope.$watch('vm.showModal', function(current) {
        if(current) {
          element.find('#modalAdvancedSearch').modal('show');
          ctrl.showModal = false;
        }
      });

      ctrl.addCondition = addCondition;
      ctrl.removeCondition = removeCondition;
      ctrl.addOrUpdateConditions = addOrUpdateConditions;
      ctrl.conditions = [];
      ctrl.selectedConditions = [];

      ctrl.index = 0;

      function draw() {
        var el = $compile(ctrl.conditions.join(''))(scope);
        element.find('#divConditions').html(el);
      }

      function addCondition() {
        ctrl.selectedConditions.push(createCondition(ctrl.currentOption.label, ctrl.currentOption.name));
        ctrl.conditions.push('<search-condition selected-conditions="vm.selectedConditions" index="' + ctrl.index + '" remove="vm.removeCondition({index:' + ctrl.index + '})"></search-condition>');
        ++ctrl.index;
        draw();
      }

      function removeCondition(e) {
        var els = element.find('#divConditions search-condition');
        for(var i = 0; i < els.length; i++) {
          if($(els[i]).attr('index') == e.index) {
            ctrl.selectedConditions.splice(i, 1);
            ctrl.conditions.splice(i, 1);
            break;
          }
        }
        draw();
        ctrl.index = 0;
        els = element.find('#divConditions search-condition');
        for(var i = 0; i < els.length; i++) {
          ++ctrl.index;
        }
      }

      function addOrUpdateConditions() {
        $log.debug(ctrl.selectedConditions);
      }
    }
  }

})();