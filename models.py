from __future__ import unicode_literals

from django.db import models


class Machine(models.Model):
    machine_name = models.CharField(max_length=50)
    machine_info = models.TextField()

    def __str__(self):
        return r'machine_name: %s, machine_info: %s' % (self.machine_name, self.machine_info)


class Device(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE)
    cpu = models.CharField(max_length=50)
    memory = models.CharField(max_length=20)
    storage= models.CharField(max_length=50)
    nic = models.CharField(max_length=50)

    def __str__(self):
        return r'cpu: %s memory: %s storage: %s nic: %s' % (self.cpu, self.memory, self.storage, self.nic)


class User(models.Model):
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)     
    reservations = models.ManyToManyField(Machine, through='Reservation')

    def __str__(self):
        return r'username: %s' % self.username


class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    machine = models.ForeignKey(Machine, on_delete= models.CASCADE)
    reservation_start_time = models.DateTimeField()
    reservation_end_time = models.DateTimeField()

    def __str__(self):
        return r'reservation start_time: %s end_time: %s user: %s machine: %s' % (self.reservation_start_time, self.reservation_end_time, self.user, self.machine)

