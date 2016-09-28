from django.conf.urls import url

from . import views

app_name='tools'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login$', views.login),
    url(r'^logout$', views.logout),
    url(r'^hosts$', views.list_host),
    url(r'^nics$', views.list_nic),
    url(r'^hbas$', views.list_hba),
    url(r'^reservations/host/(?P<host_id>[0-9]+)$', views.list_reservations),
    url(r'^reservations/(?P<reservation_id>[0-9]+)/user/(?P<user_id>[0-9]+)$', views.get_or_delete_reservation),
    url(r'^reservations/host/(?P<host_id>[0-9]+)/user/(?P<user_id>[0-9]+)$', views.add_or_update_reservation),
    url(r'^reservations/host/stat$', views.get_host_reservation_stat),
    url(r'^profiles$', views.get_add_or_update_profile),
    url(r'^group/hosts/(?P<field_name>\w+)/(?P<field_value>[\w\-]*)$', views.get_grouped_host),
    url(r'^group/nics/(?P<driver_name>\w*)$', views.get_grouped_nic_driver),
    url(r'^group/hbas/(?P<driver_name>\w*)$', views.get_grouped_hba_driver),
]
