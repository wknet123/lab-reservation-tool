from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseForbidden, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core import serializers

from django.core.serializers.json import DjangoJSONEncoder

from django.views.decorators.http import require_http_methods

from django.utils import timezone

from django.db.models import Q

from .models import User, Machine, Device, Reservation

import json
import datetime
import ldap

import logging

from collections import OrderedDict

logger = logging.getLogger(__name__)


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


Server = "ldaps://ldap1-pek2.eng.vmware.com"
Base = "uid=kunw,ou=people,dc=vmware,dc=com"
Scope = ldap.SCOPE_SUBTREE
Dn = "uid=%s,ou=people,dc=vmware,dc=com"
Filter = "(&(objectClass=*))"


def ldap_auth(username, password):
    try:
        dn, secret = Dn % (username,), password

        filter_attrs = ["uid", "cn", "mail"]

        l = ldap.initialize(Server)
        l.set_option(ldap.OPT_REFERRALS, 0)
        l.protocol_version = 3
        l.simple_bind_s(dn, secret)

        r = l.search(Base, Scope, Filter, filter_attrs)

        if r:
            try:
                u = User.objects.get(username=username)
                _, user = l.result(r, 60)
                name, attrs = user[0]
            except User.DoesNotExist:
                u = User(username=username,
                         fullname=attrs['cn'][0],
                         email=attrs['mail'][0])
                u.save()
            finally:
                return u
    except Exception as e:
        logger.error('Login via LDAP failed: %s', e.message)
        return None


@require_http_methods(["POST"])
def login(request):

    if not request.body:
        return HttpResponseBadRequest()
    
    r = json.loads(request.body)

    username = r['username']
    password = r['password']

    user = ldap_auth(username, password)
    if user:
        request.session['user_id'] = user.pk
        request.session['username'] = username

        resp = HttpResponse()
        resp.set_cookie(key='user_id', value=user.pk)
        resp.set_cookie(key='username', value=username)
        return resp
    return HttpResponseForbidden()


@require_http_methods(["GET"])
def logout(request):
    request.session.clear()
    return HttpResponseRedirect(reverse("tools:index"))


@require_http_methods(["GET"])
def list_machines(request):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseRedirect(reverse("tools:index"))
    machine_name = request.GET['machine_name']
    return decode_request(Machine.objects.filter(machine_name__contains=machine_name))


@require_http_methods(["GET"])
def get_machine_by_id(request, machine_id):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')
    try:
        machine = Machine.objects.filter(pk=machine_id)
        return decode_request(machine)
    except KeyError:
        return HttpResponseBadRequest()


@require_http_methods(["GET"])
def get_device_by_machine(request, machine_id):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')
    try:
        device = Device.objects.filter(machine=Machine(pk=machine_id))
    except Device.DoesNotExist:
        return HttpResponseBadRequest()
    return decode_request(device)


@require_http_methods(["POST", "PUT"])
def add_or_update_reservation(request, machine_id, user_id):

    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    logger.debug('machine_id: %s, user_id: %s, session_user_id: %s' % (machine_id, user_id, session_user_id))

    if session_user_id == int(user_id):
        r = json.loads(request.body)
        input_start_time = covert_datetime(r['reservation_start_time'])
        input_end_time = covert_datetime(r['reservation_end_time'])

        if input_end_time < input_start_time :
            return HttpResponseBadRequest("End time can not be earlier than start time.")

        if request.method == 'POST':
            try:
                other_reservations = Reservation.objects.filter(
                    machine=Machine(pk=machine_id),
                ).filter(
                    Q(reservation_start_time__gte=input_start_time) &
                    Q(reservation_end_time__lte=input_end_time)
                )
                if len(other_reservations) > 0:
                    return HttpResponseBadRequest("Already reserved at the same time.")

                reservation = Reservation(
                    reservation_start_time=input_start_time,
                    reservation_end_time=input_end_time,
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
                other_reservations = Reservation.objects.filter(
                    ~Q(pk=r['reservation_id']),
                    machine=Machine(pk=machine_id),
                ).filter(
                    Q(reservation_start_time__gte=input_start_time) &
                    Q(reservation_end_time__lte=input_end_time)
                )
                if len(other_reservations) > 0:
                    return HttpResponseBadRequest("Already reserved at the same time.")

                Reservation.objects.filter(
                    pk=r['reservation_id'],
                ).update(
                    reservation_start_time=input_start_time,
                    reservation_end_time=input_end_time,
                )
                return HttpResponse()
            except Exception as e:
                logger.error('Error occurred while updating reservation: %s' % e.message)
                return HttpResponseBadRequest()
    else:
        return HttpResponseNotAllowed("Reservation by others")


@require_http_methods(["GET", "DELETE"])
def get_or_delete_reservation(request, reservation_id, user_id):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')
    logger.debug('session_user_id: %d' % (session_user_id))

    if request.method == 'GET':
        try:
            reservation = Reservation.objects.select_related().filter(
                pk=reservation_id
            )
            users = []
            for r in reservation:
                u = get_user_by_id(r.user.id)
                users.append({'username': u.username})
            return decode_request(reservation, others=users)
        except (KeyError, Reservation.DoesNotExist):
            logger.error('No reservation exist.')
            return HttpResponseBadRequest()

    if session_user_id == int(user_id) and request.method == 'DELETE':
        try:
            reservation = Reservation.objects.get(
                pk=reservation_id)
            if reservation:
                reservation.delete()
        except Exception as e:
            logger.error('Error occurred while deleting reservation: %s' % e.message)
        finally:
            return HttpResponse()
    else:
        return HttpResponseNotAllowed("Reservation by others")


@require_http_methods(["GET"])
def list_reservations(request, machine_id):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')
    try:
        reservations = Reservation.objects.select_related().filter(machine=Machine(pk=machine_id))
        users = []
        for r in reservations:
            u = get_user_by_id(r.user.id)
            users.append({'username': u.username})
        return decode_request(reservations, others=users)
    except (KeyError, Reservation.DoesNotExist):
        logger.error('No reservations exist.')
        return HttpResponseBadRequest()


def get_user_by_id(user_id):
    try:
        user=User.objects.get(pk=user_id)
        return user
    except:
        logger.error('Error occurred while getting user by ID: %d' % (id,))
    return None