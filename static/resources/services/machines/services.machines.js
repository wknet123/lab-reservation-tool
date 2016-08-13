(function() {
  
  'use strict';
  
  angular
    .module('services.machines', [])
    .factory('MachineService', MachineService);
  
  MachineService.$inject = ['Machines', '$q', '$timeout', '$http'];
  
  function MachineService(Machines, $q, $timeout, $http) {
    return {
      'listAll': listAll,
      'getByID': getByID,
          'add': add,
       'update': update,
       'remove': remove
    };
    
    function listAll() {
      return $http.get('/tools/machines');
    }
    
    function getByID(id) {
      return $http.get('/tools/machines/' + id);
    }
    
    function add(machine) {
      var lastId = Machines.length > 0 ? Machines[Machines.length - 1].id : 0;
      machine.id = ++lastId;
      Machines.push(machine);
    }
    
    function update(machine) {
      for(var i in Machines) {
        var m = Machines[i];
        if(m.id == machine.id) {
          m.machine = machine.machine;
          return true;
        }
      }
      return false;
    }
    
    function remove(id) {
      for(var i in Machines) {
        var m = Machines[i];
        if(m.id == id) {
          Machines.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  }
  
})();