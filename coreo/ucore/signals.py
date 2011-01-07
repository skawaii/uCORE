import datetime

from django.core.mail import send_mail

from coreo.ucore.models import CoreUser, SearchLog, Trophy, TrophyCase, Tag


def singular_check(user, search_tag_name): 
  if (SearchLog.objects.filter(user=user, search_tags=Tag.objects.filter(name__startswith=search_tag_name)).count() > 4):
    trophyObj = Trophy.objects.get(tag=search_tag_name)
    if (trophyObj and TrophyCase.objects.filter(user=user, trophy=trophyObj).count() == 0):
      custom_message = 'Congratulations %s, you have won a trophy (%s)' % (user.first_name, trophyObj.name)
      send_mail(custom_message, 'Testing e-mail', 'trophy@layedintel.com', [user.email], fail_silently=False)
      t = TrophyCase(user=user, trophy=trophyObj, date_earned=datetime.datetime.now())
      t.save()


def check_for_trophy(sender, instance, **kwargs):
  user = CoreUser.objects.get(username=instance.user.username)
  for tag_name in Tag.objects.all():
    singular_check(user, tag_name)

