(function() {
  
  'use strict';
  
  angular
    .module('components.reservations')
    .directive('listReservations', listReservations);
    
  ListReservationsController.$inject = ['$scope', 'HostService', 'NicService', 'HbaService', 'ReservationService', 'ProfileService', '$log', '$cookies', '$filter', 'dateFilter', '$window'];
  
  function ListReservationsController($scope, HostService, NicService, HbaService, ReservationService, ProfileService, $log, $cookies, $filter, dateFilter, $window) {
    var vm = this;

    vm.toAddOrUpdateReservation = toAddOrUpdateReservation;
    vm.retrieve = retrieve;
    vm.loginUsername = $cookies.get('username');
    vm.getNics = getNics;
    vm.getHbas = getHbas;
    vm.getReservations = getReservations;
    vm.searchHost = searchHost;
    vm.toAdvancedSearch = toAdvancedSearch;
    vm.toListReservationStat = toListReservationStat;

    vm.retrieve('');

    ProfileService.get()
      .then(getProfileSuccess, getProfileFailed);

    $scope.$on('updatedDatetime', function(e, val) {
      if(val) {
        var target = val.pickerId;
        switch(target) {
        case 'fromSearchDatetimePicker':
          vm.reservationStartTime = val.datetime; break;
        case 'toSearchDatetimePicker':
          vm.reservationEndTime = val.datetime; break;
        }
      }
    });

    vm.reloadProfiles = reloadProfiles;

    $scope.$watch('vm.hostName', function(current) {
      if(current) {
        vm.retrieve(current);
      }
    });

    function toAddOrUpdateReservation(reservationId, targetType) {
      vm.targetType = targetType;
      vm.hostId = vm.selectedHost.pk;
      vm.hostName = vm.selectedHost.fields.host_name;

      vm.userId = $cookies.get('user_id');
      vm.username = $cookies.get('username');

      if(vm.targetType === 'EDIT') {
        vm.reservationId = reservationId;
      }

      vm.showModal = true;
    }

    function retrieve(hostName) {
      HostService.listAll(hostName)
        .then(listHostsSuccess, listHostsFailed);
    }

    function searchHost(hostName) {
      vm.retrieve(hostName);
    }

    function listHostsSuccess(response) {
      vm.hosts = response.data;
      if (vm.hosts && vm.hosts.length > 0) {
        vm.selectedHost = vm.hosts[0];
        vm.getReservations();
      }else{
        $scope.$emit('modalTitle', 'No found in search');
        $scope.$emit('modalMessage', 'No host was found with current filter options.');
        $scope.$emit('raiseError', true);

      }
    }

    function listHostsFailed(response) {
      $log.error('Failed to list hosts:' + angular.toJson(response));
    }

    function getReservations() {
      if(vm.selectedHost) {
        ReservationService.listAll(vm.selectedHost.pk)
          .then(getReservationsByHostSuccess, getReservationsByHostFailed);
      }
    }

    function getReservationsByHostSuccess(response) {
      vm.reservations = response.data;
    }

    function getReservationsByHostFailed(response) {
      $log.error('No reservations exist.');
    }

    function getNics() {
      if(vm.selectedHost) {
        NicService.getByHostName(vm.selectedHost.fields.host_name)
          .then(getNicByHostNameSuccess, getNicByHostNameFailed);
      }
    }

    function getNicByHostNameSuccess(response) {
      vm.nics = response.data;
    }

    function getNicByHostNameFailed(response) {
      $log.error('Failed to get nics by host name:' + response.data);
    }

    function getHbas() {
      if(vm.selectedHost) {
        HbaService.getByHostName(vm.selectedHost.fields.host_name)
          .then(getHbaByHostNameSuccess, getHbaByHostNameFailed);
      }
    }

    function getHbaByHostNameSuccess(response) {
      vm.hbas = response.data;
    }

    function getHbaByHostNameFailed(response) {
      $log.error('Failed to get hbas by host name:' + response.data);
    }

    function toAdvancedSearch() {
      vm.showAdvancedSearch = true;
    }

    function toListReservationStat() {
      vm.showListReservationStat = true;
    }

    function getDateStr(date, deltaOfDays, deltaOfHours) {
      var d = new Date(date);
      var target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if(!deltaOfDays) {
        deltaOfDays = 0;
      }
      if(!deltaOfHours) {
        deltaOfHours = 0;
      }

      target = new Date(target.getTime() + 1000 * 60 * 60 *24 * deltaOfDays + 1000 * 60 * 60 * deltaOfHours);

      return $filter('dateL')(target, 'YYYY-MM-DD HH:mm');
    }

    function getProfileSuccess(response) {
      var profile = response.data;
      vm.reservationStartTime= getDateStr(profile.reservation_start_time);
      vm.reservationEndTime = getDateStr(profile.reservation_end_time, 0, 23);
    }

    function getProfileFailed(response) {
      $log.error('Failed to get profile.');
    }

    function reloadProfiles() {
      ProfileService
        .addOrUpdate({'reservationStartTime': vm.reservationStartTime, 'reservationEndTime': vm.reservationEndTime})
        .then(addOrUpdateProfileSuccess, addOrUpdateProfileFailed);
    }

    function addOrUpdateProfileSuccess(response) {
      $log.debug('Successful update profile.');
      $window.location.reload();
    }

    function addOrUpdateProfileFailed(response) {
      $log.debug('Failed to update profile.');
    }

  }
  
  listReservations.$inject = [];
  
  function listReservations() {
    var directive = {
      'restrict': 'E',
      'templateUrl': '/tools/static/resources/components/reservations/list-reservations.directive.html',
      'scope': true,
      'controller': ListReservationsController,
      'link': link,
      'controllerAs': 'vm',
      'bindToController': true
    };
    return directive;

    function link(scope, element, attrs, ctrl) {

      ctrl.selectHost = selectHost;
      ctrl.postSelection = postSelection;

      ctrl.postSelection();

      element.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        var target = $(e.target).attr('aria-controls');
        switch(target) {
        case 'systeminfo':
          break;
        case 'nic':
          ctrl.getNics();
          break;
        case 'hba':
          ctrl.getHbas();
          break;
        case 'reservations':
          ctrl.getReservations();
          break;
        }
      });

      element.find('#myTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        scope.$apply();
      });

      function selectHost(m) {
        ctrl.selectedHost = m;
        ctrl.reservations = [];
        ctrl.postSelection();
      }

      function postSelection() {
        element.find('#myTabs a:first').tab('show');
      }
    }
  }
  
})();