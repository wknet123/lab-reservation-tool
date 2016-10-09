from __future__ import unicode_literals

from django.db import models


'''
CREATE TABLE `test1` (
  `Host_id` smallint(50) NOT NULL,
  `HostName` varchar(50) DEFAULT NULL,
  `Group_` varchar(50) DEFAULT NULL,
  `Location` varchar(50) DEFAULT NULL,
  `Vendor` varchar(50) DEFAULT NULL,
  `Model` varchar(50) DEFAULT NULL,
  `CPU_Vendor` varchar(50) DEFAULT NULL,
  `CPU_Code_Name` varchar(50) DEFAULT NULL,
  `CPU_Model_Name` varchar(50) DEFAULT NULL,
  `CPU_Speed` varchar(50) DEFAULT NULL,
  `CPU_Sockets` tinyint(50) DEFAULT NULL,
  `Total_CPU_Cores` tinyint(50) DEFAULT NULL,
  `Total_CPU_threads` tinyint(50) DEFAULT NULL,
  `Memory` varchar(50) DEFAULT NULL,
  `Total_NICs` tinyint(50) DEFAULT NULL,
  `Total_HBAs` tinyint(50) DEFAULT NULL,
  PRIMARY KEY (`Host_id`),
  KEY `HostName` (`HostName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
 into app.test4 select * from RUNOOB.test4;

'''


class Host(models.Model):
    host_name = models.CharField(max_length=50)
    group = models.CharField(max_length=50)
    location = models.CharField(max_length=50)
    vendor = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    cpu_vendor = models.CharField(max_length=50)
    cpu_code_name = models.CharField(max_length=50)
    cpu_model_name = models.CharField(max_length=50)
    cpu_speed = models.CharField(max_length=50)
    cpu_sockets = models.SmallIntegerField()
    total_cpu_cores = models.SmallIntegerField()
    total_cpu_threads = models.SmallIntegerField()
    memory = models.CharField(max_length=50)
    total_nics = models.SmallIntegerField()
    total_hbas = models.SmallIntegerField()

    def __str__(self):
        return 'host_name: %s, vendor: %s, memory: %s' % (self.host_name, self.vendor, self.memory)


class User(models.Model):
    username = models.CharField(max_length=50)
    fullname = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    reservations = models.ManyToManyField(Host, through='Reservation')

    def __str__(self):
        return r'username: %s' % self.username


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    filter_option = models.TextField()
    reservation_start_time = models.DateTimeField()
    reservation_end_time = models.DateTimeField()
    update_time = models.DateTimeField()

    def __str__(self):
        return r'profile of user filter_option: %s, start_time: %s, end_time: %s, last update_time: %s' % (self.filter_option, self.reservation_start_time, self.reservation_end_time, self.update_time)


class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    host = models.ForeignKey(Host, on_delete=models.CASCADE)
    reservation_start_time = models.DateTimeField()
    reservation_end_time = models.DateTimeField()

    def __str__(self):
        return r'reservation start_time: %s end_time: %s user: %s host: %s' % (self.reservation_start_time, self.reservation_end_time, self.user, self.host)



'''
CREATE TABLE `test2` (
  `HostName` varchar(255) DEFAULT NULL,
  `VMK_Name_Alias_NIC` varchar(255) DEFAULT NULL,
  `Driver_NIC` varchar(255) DEFAULT NULL,
  `MAC_Address_NIC` varchar(255) DEFAULT NULL,
  `Description_NIC` varchar(255) DEFAULT NULL,
  `Driver_version_NIC` varchar(255) DEFAULT NULL,
  `Firmware_NIC` varchar(255) DEFAULT NULL,
  KEY `hostname` (`HostName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
'''


class Nic(models.Model):
    host_name = models.CharField(max_length=50)
    vmk_name_alias = models.CharField(max_length=255)
    nic_driver = models.CharField(max_length=255)
    mac_address = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    driver_version = models.CharField(max_length=255)
    firmware = models.CharField(max_length=255)

    def __str__(self):
        return 'host_name: %s, vmk_name_alias: %s, driver: %s' % (self.host_name, self.vmk_name_alias, self.nic_driver)


'''
CREATE TABLE `test3` (
  `HostName` varchar(255) NOT NULL,
  `VMK_Name_Alias_HBA` varchar(255) DEFAULT NULL,
  `Driver_HBA` varchar(255) DEFAULT NULL,
  `Lin_State_HBA` varchar(255) DEFAULT NULL,
  `Transport_Identifier_HBA` varchar(255) DEFAULT NULL,
  `BusInfo_Description_HBA` varchar(255) DEFAULT NULL,
  KEY `host` (`HostName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
'''


class Hba(models.Model):
    host_name = models.CharField(max_length=50)
    vmk_name_alias = models.CharField(max_length=255)
    hba_driver = models.CharField(max_length=255)
    lin_state = models.CharField(max_length=255)
    transport_identifier = models.CharField(max_length=255)
    bus_info_description = models.CharField(max_length=255)

    def __str__(self):
        return 'host_name: %s, vmk_name_alias: %s, lin_state: %s, bus_info: %s' % (self.host_name, self.vmk_name_alias, self.lin_state, self.bus_info_description)