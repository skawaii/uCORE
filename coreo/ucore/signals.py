import datetime

from django.core.mail import send_mail

from coreo.ucore.models import CoreUser, SearchLog, Trophy, TrophyCase


def check_for_trophy(sender, instance, **kwargs):
  user1 = instance.user.username

  if (SearchLog.objects.filter(user=instance.user, search_tags=1).count() > 4):
    # print "Inside the search condition of the check"
    user_object = CoreUser.objects.get(username=user1)
    trophy1 = Trophy.objects.get(pk=4)

    if (TrophyCase.objects.filter(user=user_object, trophy=trophy1).count() == 0):
      custom_message = 'Congratulations %s, you have won a trophy (Captain Blackbeard)' % user_object.first_name
      email1 = user_object.email
      send_mail(custom_message, 'Testing e-mail', 'trophy@layedintel.com', [email1], fail_silently=False)
      # I need to make the trophy type conditional eventually.
      # for now I will hard-code the trophy-type.
      t = TrophyCase(user=user_object, trophy=trophy1, date_earned=datetime.datetime.now())
      t.save()

  if (SearchLog.objects.filter(user=instance.user, search_tags=2).count() > 4):
    user_object = CoreUser.objects.get(username=user1)
    trophy1 = Trophy.objects.get(pk=3)
    
    if (TrophyCase.objects.filter(user=user_object, trophy=trophy1).count() == 0):
      custom_message = 'Congratulations %s, you have won a trophy (Forrest Ranger)' % user_object.first_name
      email1 = user_object.email
      send_mail(custom_message, 'Testing e-mail', 'trophy@layedintel.com', [email1], fail_silently=False)
      # I need to make the trophy type conditional eventually.
      # for now I will hard-code the trophy-type.
      t = TrophyCase(user=user_object, trophy=trophy1, date_earned=datetime.datetime.now())
      t.save()

  if (SearchLog.objects.filter(user=instance.user, search_tags=3).count() > 4):
    user_object = CoreUser.objects.get(username=user1)
    trophy1 = Trophy.objects.get(pk=2)

    if (TrophyCase.objects.filter(user=user_object, trophy=trophy1).count() == 0):
      custom_message = 'Congratulations %s, you have won a trophy (Artic King)' % user_object.first_name
      email1 = user_object.email
      send_mail(custom_message, 'Testing e-mail', 'trophy@layedintel.com', [email1], fail_silently=False)
      # I need to make the trophy type conditional eventually.
      # for now I will hard-code the trophy-type.
      t = TrophyCase(user=user_object, trophy=trophy1, date_earned=datetime.datetime.now())
      t.save()

