from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseForbidden
from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone

from .models import User, Machine, Device, Reservation

import json
import datetime

import logging


logger = logging.getLogger(__name__)

def decode_request(obj):
    raw_data = serializers.serialize('python', obj)
    # target_data = [d['fields'] for d in raw_data]
    return HttpResponse(json.dumps(raw_data, cls=DjangoJSONEncoder), content_type='application/json')


def covert_datetime(datetime_str):
    t = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')
    return timezone.make_aware(t, timezone=timezone.get_current_timezone(), is_dst=None)


def index(request):
    return render(request, 'tools/index.htm')


def login(request):
    if request.method == 'POST':
        r = json.loads(request.body)
        username = r['username']
        password = r['password']
        try:
            user = User.objects.get(username=username, password=password)
            request.session['user_id'] = user.pk
            request.session['username'] = username

            resp =  HttpResponse()
            resp.set_cookie(key='user_id', value=user.pk)
            resp.set_cookie(key='username', value=username)
            return resp

        except User.DoesNotExist:
            return HttpResponseBadRequest()
    return HttpResponseNotAllowed()


def list_machines(request):
    try:
        request.session['user_id']
    except KeyError:
        return HttpResponseForbidden('Please login first.')

    if request.method == 'GET':
        machines = Machine.objects.all()
        return decode_request(machines)
    return HttpResponseNotAllowed()


def get_machine_by_id(request, machine_id):
    try:
        request.session['user_id']
    except KeyError:
        return HttpResponseForbidden('Please login first.')
    if request.method == 'GET':
        try:
            machine = Machine.objects.filter(pk=machine_id)
            return decode_request(machine)
        except KeyError:
            return HttpResponseBadRequest()
    return HttpResponseNotAllowed()


def get_device_by_machine(request, machine_id):
    if request.method == 'GET':
        try:
            device = Device.objects.filter(machine=Machine(pk=machine_id))
        except Device.DoesNotExist:
            return HttpResponseBadRequest()
        return decode_request(device)
    return HttpResponseNotAllowed()


def add_or_update_reservation(request, machine_id):
    try:
        user_id = request.session['user_id']
    except KeyError:
        return HttpResponseForbidden('Please login first.')

    if request.method == 'POST':
        try:
            r = json.loads(request.body)
            logger.debug(r)
            reservation = Reservation(
                reservation_start_time=covert_datetime(r['reservation_start_time']),
                reservation_end_time=covert_datetime(r['reservation_end_time']),
                machine=Machine(pk=machine_id),
                user=User(pk=user_id),
            )
            reservation.save()
            return decode_request([reservation])
        except Exception as e:
            logger.error('Error occurred while adding reservation: %s' % e.message)
            return HttpResponseBadRequest()

    elif request.method == 'PUT':
        try:
            r = json.loads(request.body)
            reservation = Reservation.objects.filter(
                machine=Machine(pk=machine_id),
                user=User(pk=user_id),
            ).update(
                reservation_start_time=covert_datetime(r['reservation_start_time']),
                reservation_end_time=covert_datetime(r['reservation_end_time']),
            )
            return HttpResponse()
        except Exception as e:
            logger.error('Error occurred while updating reservation: %s' % e.message)
            return HttpResponseBadRequest()

    return HttpResponseNotAllowed()


def list_reservations(request):
    try:
        user_id = request.session['user_id']
    except KeyError:
        return HttpResponseForbidden("Please login first.")

    if request.method == 'GET':
        try:
            reservations = Reservation.objects.filter(user=User(pk=user_id))
            return decode_request(reservations)
        except (KeyError, Reservation.DoesNotExist):
            logger.error('No reservations exist.')
            return HttpResponseBadRequest()
    return HttpResponseNotAllowed()


def get_reservation_by_machine_id(request, machine_id):
    try:
        user_id = request.session['user_id']
    except KeyError:
        return HttpResponseForbidden('Please login first.')
    if request.method == 'GET':
        try:
            reservation = Reservation.objects.filter(
                machine=Machine(pk=machine_id),
                user=User(pk=user_id),
            )
            return decode_request(reservation)
        except (KeyError, Reservation.DoesNotExist):
            logger.error('No reservation exist.')
            return HttpResponseBadRequest()
    return HttpResponseNotAllowed()
