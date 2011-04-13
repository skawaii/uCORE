from django.conf.urls.defaults import *
from django.contrib import databrowse

from coreo.ucore.models import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  '/Users/skawaii/sandbox/work/ucore/coreo/media/', 'show_indexes':True}),
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  'C:/dev/django-1.2.3/ucore/coreo/media/', 'show_indexes':True}),
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  '/Users/pboone/code/ucore/coreo/media/', 'show_indexes':True}),
    (r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  '/Users/pcoleman/uCORE/coreo/media', 'show_indexes':True}), 
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  '/Users/pboone/code/ucore/coreo/media/', 'show_indexes':True}),
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  '/Users/pcoleman/uCORE/coreo/media', 'show_indexes':True}), 
    # (r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':   '/Users/jashot7/Code/uCORE/uCORE/coreo/media', 'show_indexes':True}),  
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':  '/Users/pcoleman/uCORE/coreo/media', 'show_indexes':True}),
    #(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':   '/Users/jashot7/Dropbox/Code/uCORE/uCORE/coreo/media', 'show_indexes':True}),  

    # Example:
    # (r'^coreo/', include('coreo.foo.urls')),
    # (r'^ucore/', include('coreo.ucore.urls')),
    (r'^', include('coreo.ucore.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    (r'^admin/', include(admin.site.urls)),
    (r'^databrowse/(.*)', databrowse.site.root),
)

databrowse.site.register(CoreUser)
databrowse.site.register(Link)
databrowse.site.register(LinkLibrary)
databrowse.site.register(Notification)
databrowse.site.register(POC)
databrowse.site.register(Rating)
databrowse.site.register(RatingFK)
databrowse.site.register(Skin)
databrowse.site.register(Tag)
databrowse.site.register(Trophy)
databrowse.site.register(TrophyCase)

