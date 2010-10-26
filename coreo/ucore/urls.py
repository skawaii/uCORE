from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('coreo.ucore.views',
    (r'^$', 'index'),
    (r'^register/(?P<sid>\w*)/$', 'register'), # the regex should probably enforce a min length
    (r'^ge/$', 'geindex'),
    (r'^save-user/$', 'save_user'),
    (r'^userprofile/$', 'userprofile'), 
    (r'^login/$', 'login'),
    (r'^login-user/$', 'login_user'),
    (r'^logout-user/$', 'logout_user'),
    (r'^search-links/(?P<keywords>.+)/$', 'search_links'),
    (r'^upload-csv/$', 'upload_csv'),
    (r'^ajax/$', 'ajax_me'),
)

