from django.contrib import admin

from coreo.ucore.models import CoreUser, Link, LinkLibrary, Notification, Rating, SearchLog, Skin, Tag, Trophy, TrophyCase


admin.site.register(CoreUser)
admin.site.register(Link)
admin.site.register(LinkLibrary)
admin.site.register(Notification)
admin.site.register(Rating)
admin.site.register(SearchLog)
admin.site.register(Skin)
admin.site.register(Tag)
admin.site.register(Trophy)
admin.site.register(TrophyCase)

