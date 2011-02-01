import datetime, logging

from django.core.mail import send_mail

from coreo.ucore.models import CoreUser, Notification, SearchLog, Tag, Trophy, TrophyCase


def singular_check(user, search_tag_name): 
  if (SearchLog.objects.filter(user=user, search_tags=Tag.objects.filter(name__startswith=search_tag_name)).count() > 4):
    trophyObj = Trophy.objects.get(tag=search_tag_name)
    if (trophyObj and TrophyCase.objects.filter(user=user, trophy=trophyObj).count() == 0):
      t = TrophyCase(user=user, trophy=trophyObj, date_earned=datetime.datetime.now())
      t.save()
      msg = 'You have won a %s trophy' % trophyObj.name
      Notification.objects.create(user=user, type='TR', message=msg)


def send_trophy_email(sender, instance, **kwargs):
  user = CoreUser.objects.get(username=instance.user.username)
  trophyObj = Trophy.objects.get(name=instance.trophy.name)
  custom_message = 'Congratulations %s, you have won a trophy (%s)' % (user.first_name, trophyObj.name)
  send_mail(custom_message, 'Testing e-mail', 'trophy@layedintel.com', [user.email], fail_silently=False)


def check_for_trophy(sender, instance, **kwargs):
  user = CoreUser.objects.get(username=instance.user.username)
  for tag_name in Tag.objects.all():
    singular_check(user, tag_name)


def initialize_new_user(sender, **kwargs):
  # if created is True, then this is a new user registration and the registration trophy needs
  # to be added to their TrophyCase
  if kwargs['created']:
    TrophyCase.objects.create(user=kwargs['instance'], trophy=Trophy.objects.get(name__contains='Registration'),
       date_earned=datetime.datetime.now())
    #Notification.objects.create(user=user, type='TR', message='You have won a registration trophy.')

