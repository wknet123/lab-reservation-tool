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
    url(r'^profiles$', views.get_add_or_update_profile)
]
