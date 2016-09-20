from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseForbidden, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core import serializers

from django.core.serializers.json import DjangoJSONEncoder

from django.views.decorators.http import require_http_methods

from django.utils import timezone

from django.db.models import Q, Count

from .models import User, Reservation, Host, Nic, Hba, Profile

import json

from datetime import datetime, timedelta

import ldap
import operator

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


class SimpleEncoder(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


def simple_decode_request(raw_data):
    return HttpResponse(json.dumps(raw_data, cls=SimpleEncoder), content_type='application/json')


def covert_datetime(datetime_str):
    t = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')
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
        _, user = l.result(r, 60)
        _, attrs = user[0]

        if r:
            try:
                u = User.objects.get(username=username)
            except User.DoesNotExist:
                u = User(username=username,
                         fullname=attrs['cn'][0],
                         email=attrs['mail'][0])
                u.save()
                last_inserted_user = User.objects.get(username=username)

                now = datetime.now().date()

                Profile.objects.create(
                    user=last_inserted_user,
                    filter_option=[],
                    reservation_start_time=now - timedelta(days=10),
                    reservation_end_time=now + timedelta(days=10),
                    update_time=now)
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

    if 'username' in r and 'password' in r:
        username = r['username']
        password = r['password']
    else:
        return HttpResponseBadRequest()

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
def list_host(request):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseRedirect(reverse("tools:index"))

    host_name = request.GET['host_name']

    filter_options = get_profile_by_target('host', int(session_user_id), host_name)
    filtered_host_results = Host.objects.filter(generate_filter(filter_options))
    host = get_host_from_list(filtered_host_results)

    filter_nic_options = get_profile_by_target('nic', int(session_user_id), host_name)
    filtered_nic_results = Nic.objects.filter(generate_filter(filter_nic_options))
    host_in_nic = get_host_from_list(filtered_nic_results)

    filter_hba_options = get_profile_by_target('hba', int(session_user_id), host_name)
    filtered_hba_results = Hba.objects.filter(generate_filter(filter_hba_options))
    host_in_hba = get_host_from_list(filtered_hba_results)

    hosts = host.intersection(host_in_nic.intersection(host_in_hba))

    filtered_results = []
    for filtered_host in filtered_host_results:
        if filtered_host.host_name in hosts:
            filtered_results.append(filtered_host)

    return decode_request(filtered_results)


def get_host_from_list(results):
    hosts = []
    for r in results:
        if hasattr(r, 'host_name'):
            hosts.append(r.host_name)
        elif hasattr(r, 'host') and hasattr(r.host, 'host_name'):
            hosts.append(r.host.host_name)

    return set(hosts)


@require_http_methods(["GET"])
def list_nic(request):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseRedirect(reverse("tools:index"))
    host_name = request.GET['host_name']
    if len(host_name) == 0:
        return HttpResponseNotAllowed("Please provide host name as filter.")

    filter_options = get_profile_by_target('nic', int(session_user_id), host_name)
    filtered_results = Nic.objects.filter(generate_filter(filter_options))

    logger.debug(filtered_results.query)

    return decode_request(filtered_results)


@require_http_methods(["GET"])
def list_hba(request):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseRedirect(reverse("tools:index"))
    host_name = request.GET['host_name']
    if len(host_name) == 0:
        return HttpResponseNotAllowed("Please provide host name as filter.")

    filter_options = get_profile_by_target('hba', int(session_user_id), host_name)
    filtered_results = Hba.objects.filter(generate_filter(filter_options))

    return decode_request(filtered_results)


@require_http_methods(["POST", "PUT"])
def add_or_update_reservation(request, host_id, user_id):

    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    logger.debug('host_id: %s, user_id: %s, session_user_id: %s' % (host_id, user_id, session_user_id))

    if session_user_id == int(user_id):
        r = json.loads(request.body)
        input_start_time = covert_datetime(r['reservation_start_time'])
        input_end_time = covert_datetime(r['reservation_end_time'])

        if input_end_time < input_start_time :
            return HttpResponseBadRequest("End time can not be earlier than start time.")

        filter_expr = ((Q(reservation_start_time__lte=input_start_time) &
                        Q(reservation_end_time__gte=input_end_time)) |
                       (Q(reservation_start_time__gte=input_start_time) &
                        Q(reservation_end_time__lte=input_end_time)) |
                       (Q(reservation_end_time__gte=input_start_time) &
                        Q(reservation_start_time__lte=input_end_time)))

        if request.method == 'POST':
            try:
                other_reservations = Reservation.objects.filter(host=Host(pk=host_id)).filter(filter_expr)

                if len(other_reservations) > 0:
                    return HttpResponseBadRequest("Already reserved at the same time.")

                reservation = Reservation(
                    reservation_start_time=input_start_time,
                    reservation_end_time=input_end_time,
                    host=Host(pk=host_id),
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
                    host=Host(pk=host_id),
                ).filter(filter_expr)

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
    logger.debug('session_user_id: %d' % session_user_id)

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
def list_reservations(request, host_id):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')
    try:
        reservations = Reservation.objects.select_related().filter(host=Host(pk=host_id))
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
        user = User.objects.get(pk=user_id)
        return user
    except:
        logger.error('Error occurred while getting user by ID: %d' % (id,))
    return None


@require_http_methods(["GET", "POST"])
def get_add_or_update_profile(request):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    if request.method == 'GET':
        profile = Profile.objects.get(user=User(pk=session_user_id))
        simple_result = {
            'filter_option': eval(profile.filter_option),
            'reservation_start_time': profile.reservation_start_time.strftime('%Y-%m-%d %H:%M'),
            'reservation_end_time': profile.reservation_end_time.strftime('%Y-%m-%d %H:%M')
        }
        return simple_decode_request(simple_result)
    else:
        now = datetime.now()
        r = json.loads(request.body)
        logger.debug(r)
        profile = Profile.objects.get(user=User(pk=session_user_id))
        if 'filter_option' in r:
            profile.filter_option = r['filter_option']
        elif ('reservation_start_time' in r) or ('reservation_end_time' in r):
            profile.reservation_start_time = r['reservation_start_time']
            profile.reservation_end_time = r['reservation_end_time']

        profile.update_time = now
        profile.save()

        return HttpResponse()
    return HttpResponseBadRequest()


def get_profile_by_target(target, user_id, host_name):
    profile = Profile.objects.get(user=User(pk=user_id))
    options = eval(profile.filter_option)
    filter_options = [{"fieldName": "host_name", "fieldValue": host_name, "comparison": "LIKE"}]
    for option in options:
        if option['group'] == target:
            filter_options.append(option)

    logger.debug(filter_options)
    return filter_options


def generate_filter(filter_options):
    filters = []
    for option in filter_options:
        comparison = option['comparison']
        if comparison == '!=':
            filters.append(~Q(**{option['fieldName']: option['fieldValue']}))
        elif comparison == 'LIKE':
            filters.append(Q(**{option['fieldName'] + '__contains': option['fieldValue']}))
        else:
            filters.append(Q(**{option['fieldName']: option['fieldValue']}))
    return reduce(operator.and_, filters)


@require_http_methods(["GET"])
def get_grouped_host(request, field_name, field_value):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    hosts = []
    for host in Host.objects.filter(Q(**{field_name + '__contains': field_value})).values(field_name).annotate(c_grouped=Count(field_name)):
        hosts.append(host)

    return simple_decode_request(hosts)


@require_http_methods(["GET"])
def get_grouped_nic_driver(request, driver_name):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    nics = Nic.objects.filter(nic_driver__contains=driver_name).values('nic_driver').annotate(c_nic_driver=Count('nic_driver'))
    nic_drivers = []
    for n in nics:
        nic_drivers.append(n)
    return simple_decode_request(nic_drivers)


@require_http_methods(["GET"])
def get_grouped_hba_driver(request, driver_name):
    session_user_id = request.session.get('user_id', 0)
    if session_user_id == 0:
        return HttpResponseForbidden('Please login first.')

    hbas = Hba.objects.filter(hba_driver__contains=driver_name).values('hba_driver').annotate(c_hba_driver=Count('hba_driver'))
    hba_drivers = []
    for h in hbas:
        hba_drivers.append(h)
    return simple_decode_request(hba_drivers)


