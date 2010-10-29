from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('coreo.ucore.views',
    (r'^$', 'index'),
    (r'^register/(?P<sid>\w*)/$', 'register'), # the regex should probably enforce a min length
    (r'^ge/$', 'ge_index'),
    (r'^save-user/$', 'save_user'),
    (r'^user-profile/$', 'user_profile'), 
    (r'^userprofile/$', 'user_profile'), # for backwards compatibility
    (r'^login/$', 'login'),
    #(r'^login-user/$', 'login_user'),
    #(r'^logout-user/$', 'logout_user'),
    (r'^logout/$', 'logout'),
    #(r'^search-links/(?P<keywords>.+)/$', 'search_links'),
    (r'^search-links/$', 'search_links'),
    (r'^search-mongo/$', 'search_mongo'),
    (r'^upload-csv/$', 'upload_csv'),
    (r'^libraries/(?P<username>\w*)/(?P<libname>\w*)/',
    'get_library'),
)

