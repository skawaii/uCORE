from django.conf.urls.defaults import *
from django.conf import settings


urlpatterns = patterns('coreo.ucore.views',
    (r'^$', 'index'),
    (r'^register/(?P<sid>\w*)/$', 'register'), # the regex should probably enforce a min length
    (r'^ge/$', 'ge_index'),
    (r'^save-user/$', 'save_user'),
    (r'^export-csv/$', 'get_csv'),
    (r'^getshp/$', 'get_shapefile'),
    (r'^getkmz/$', 'get_kmz'),
    (r'^getkml/$', 'get_kml'),
    (r'^user-profile/$', 'user_profile'), 
    (r'^userprofile/$', 'user_profile'), # for backwards compatibility
    (r'^login/$', 'login'),
    (r'^logout/$', 'logout'),
    #(r'^search-links/(?P<keywords>.+)/$', 'search_links'),
    (r'^search-links/$', 'search_links'),
    (r'^earntrophy/$', 'earn_trophy'),
    (r'^notifications/$', 'poll_notifications'),
    (r'^trophyroom/$', 'trophy_room'),
    (r'^search-mongo/$', 'search_mongo'),
    (r'^upload-csv/$', 'upload_csv'),
    (r'^libraries/(?P<username>\w*)/(?P<lib_name>\w*)/', 'get_library'),
    (r'^rate/link/(?P<ratee_id>\d+)/$', 'rate', {'ratee': 'link'}),
    (r'^rate/library/(?P<ratee_id>\d+)/$', 'rate', {'ratee': 'library'}),
    #(r'^success/(?P<message>\w+)/$', 'success'),
    (r'^success/$', 'success'),
)

