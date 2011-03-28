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


def check_for_trophy(sender, instance, **kwargs):
  user = CoreUser.objects.get(username=instance.user.username)
  for tag_name in Tag.objects.all():
    singular_check(user, tag_name)


def send_notification_email(sender, **kwargs):
  # check the user's preferences to see if they want to receive notification emails
  notification = kwargs['instance']

  if notification.user.settings.wants_emails:
    # XXX perhaps customize the subject and body based on the notification type
    send_mail(notification.message, notification.message, 'trophy@layedintel.com', [notification.user.email], fail_silently=True)


def check_trophy_conditions(sender, **kwargs):
  trophy_case = kwargs['instance']

  if not trophy_case.date_earned and trophy_case.count >= trophy_case.trophy.earning_req:
    logging.debug('%s just earned the %s trophy' % (trophy_case.user, trophy_case.trophy.name))
    trophy_case.date_earned = datetime.date.today()
    trophy_case.save()

    Notification.objects.create(user=trophy_case.user, type='TR', message='You earned the %s trophy.' % trophy_case.trophy.name)


def initialize_new_user(sender, **kwargs):
  # if created is True, then this is a new user registration and the registration trophy needs
  # to be added to their TrophyCase
  if kwargs['created']:
    TrophyCase.objects.create(user=kwargs['instance'], trophy=Trophy.objects.get(name__contains='Registration'))


def delete_user_settings(sender, **kwargs):
  kwargs['instance'].settings.delete()

