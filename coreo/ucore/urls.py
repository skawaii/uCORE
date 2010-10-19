from django.conf.urls.defaults import *


urlpatterns = patterns('coreo.ucore.views',
    (r'^$', 'index'),
    (r'^register/(?P<sid>\w*)/$', 'register'), # the regex should probably enforce a min length
    (r'^save-user/$', 'save_user'),
    (r'^login-user/$', 'login_user'),
    (r'^logout-user/$', 'logout_user'),
    (r'^search-links/(?P<keywords>.+)/$', 'search_links'),
)

