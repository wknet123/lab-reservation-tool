(function() {
  
  'use strict';
  
  angular
    .module('lab.reservation.tool')
    .value('Users', [
      {
        'id': '1',
        'name': 'Tester01'
      },
      { 
        'id': '2',
        'name': 'Tester02'
      },
      {
        'id': '3',
        'name': 'Tester03'
      }
    ])
    .value('Machines', [
      {
        'id': '1',
        'machine': 'Dell Server 01'  
      },
      {
        'id': '2',
        'machine': 'Dell Server 02'
      },
      {
        'id': '3',
        'machine': 'Dell Server 03' 
      }
    ])
    .value('Devices', [
      {
        'id': '1',
        'machine_id': '1',
        'cpu': 'Xeon E5-2550',
        'memory': '48GB',
        'hdd': '2TB',
        'nic': 'Broadcom Ethernet Card (10/100/1000)'
      },
      {
        'id': '2',
        'machine_id': '2',
        'cpu': 'Xeon E5-2320',
        'memory': '64GB',
        'hdd': '1TB SSD',
        'nic': 'Broadcom Ethernet Card'
      },
      {
        'id': '3',
        'machine_id': '3',
        'cpu': 'Xeon E5-3370',
        'memory': '32GB',
        'hdd': '3TB',
        'nic': 'Realtek Ethernet Card'
      }
    ])
    .value('Reservations',[])
    .value('Status', [
      {
        'id': '1',
        'description': 'Long term'  
      },
      {
        'id': '2',
        'description': 'Tentative'
      },
      {
        'id': '3',
        'description': 'Returned'
      }
    ])
  
})();