from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseForbidden, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core import serializers

from django.core.serializers.json import DjangoJSONEncoder

from django.utils import timezone

from .models import User, Machine, Device, Reservation

import json
import datetime

import logging


logger = logging.getLogger(__name__)


from collections import OrderedDict


def decode_request(obj, **kwargs):
    raw_data = serializers.serialize('python', obj)
    if kwargs:
        print kwargs['others']
        i = 0
        for r in raw_data:
            for v in r.items():
                for z in v:
                    if type(z) is OrderedDict:
                        z.update(kwargs['others'][i])
            i += 1
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


def logout(request):
    request.session.clear()
    return HttpResponseRedirect(reverse("tools:index"))


def list_machines(request):

    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    if request.method == 'GET':
        machines = Machine.objects.all()
        return decode_request(machines)
    return HttpResponseNotAllowed()


def get_machine_by_id(request, machine_id):

    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
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


def crud_reservation(request, machine_id, user_id):

    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    logger.debug('machine_id: %s, user_id: %s, session_user_id: %s' % (machine_id, user_id, session_user_id))

    if request.method == 'GET':
        try:
            reservation = Reservation.objects.select_related().filter(
                machine=Machine(pk=machine_id),
                user=User(pk=user_id),
            )
            users = []
            for r in reservation:
                u = get_user_by_id(r.user.id)
                users.append({'username': u.username})
            return decode_request(reservation, others=users)
        except (KeyError, Reservation.DoesNotExist):
            logger.error('No reservation exist.')
            return HttpResponseBadRequest()

    if session_user_id == int(user_id):
        if request.method == 'POST':
            try:
                r = json.loads(request.body)
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
                Reservation.objects.filter(
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
        elif request.method == 'DELETE':
            try:
                reservation = Reservation.objects.get(
                    machine=Machine(pk=machine_id),
                    user=User(pk=user_id),
                )
                reservation.delete()
                return HttpResponse()
            except(KeyError, Reservation.DoesNotExist):
                logger.error('No reservation exist for deletion.')
                return HttpResponseBadRequest()
    else:
        return HttpResponseBadRequest("Reservation by others")


def list_reservations(request):

    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    if request.method == 'GET':
        try:
            reservations = Reservation.objects.select_related().filter()
            users = []
            for r in reservations:
                u = get_user_by_id(r.user.id)
                users.append({'username': u.username})
            return decode_request(reservations, others=users)
        except (KeyError, Reservation.DoesNotExist):
            logger.error('No reservations exist.')
            return HttpResponseBadRequest()
    return HttpResponseNotAllowed()


def get_user_by_id(user_id):
    try:
        user=User.objects.get(pk=user_id)
        return user
    except:
        logger.error('Error occurred while getting user by ID: %d' % (id,))
    return None