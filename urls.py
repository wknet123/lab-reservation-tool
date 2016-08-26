from django.conf.urls import url

from . import views

app_name='tools'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login$', views.login),
    url(r'^logout$', views.logout),
    url(r'^machines$', views.list_machines),
    url(r'^machines/(?P<machine_id>[0-9]+)$', views.get_machine_by_id),
    url(r'^devices/(?P<machine_id>[0-9]+)$', views.get_device_by_machine),
    url(r'^reservations/machine/(?P<machine_id>[0-9]+)$', views.list_reservations),
    url(r'^reservations/(?P<reservation_id>[0-9]+)/user/(?P<user_id>[0-9]+)$', views.get_or_delete_reservation),
    url(r'^reservations/machine/(?P<machine_id>[0-9]+)/user/(?P<user_id>[0-9]+)$', views.add_or_update_reservation),
]
