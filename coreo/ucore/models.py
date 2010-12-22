import datetime
from django.conf import settings
from django.core.mail import send_mail
from django.db import models
from django.contrib import auth
from django.db.models.signals import post_save


class Skin(models.Model):
  name = models.CharField(max_length=50)
  file_path = models.FilePathField('path to CSS file', path=settings.MEDIA_ROOT + 'skins')

  def __unicode__(self):
    return self.name


class Trophy(models.Model):
  name = models.CharField(max_length=50)
  desc = models.CharField('short description', max_length=100)
  file_path = models.FilePathField('path to image file', path=settings.MEDIA_ROOT + 'trophies')

  def __unicode__(self):
    #  return self.name
    return '%s %s %s' % (self.name, self.desc, self.file_path)

  class Meta:
    verbose_name_plural = 'trophies'


class Tag(models.Model):
  name = models.CharField(max_length=50, unique=True)

  def __unicode__(self):
    return self.name


class Link(models.Model):
  name = models.CharField(max_length=50)
  desc = models.CharField(max_length=256) # completely arbitrary max_length
  url = models.URLField(unique=True) # do we want verify_exists=True?
  tags = models.ManyToManyField(Tag, verbose_name='default tags')

  def __unicode__(self):
    return self.name


class CoreUser(auth.models.User):
  sid = models.CharField(max_length=20)
  phone_number = models.PositiveSmallIntegerField()
  skin = models.ForeignKey(Skin)
  trophies = models.ManyToManyField(Trophy, through='TrophyCase')
  # links = models.ManyToManyField(Link, through='LinkLibrary')

  def __unicode__(self):
    #return self.sid
    return ' '.join((self.username, self.sid))


class Rating(models.Model):
  SCORE_CHOICES = (
      (1, '1 - Utter Junk'),
      (2, '2 - Junk'),
      (3, '3 - Ok'),
      (4, '4 - Good'),
      (5, '5 - Very Good')
  )

  user = models.ForeignKey(CoreUser)
  link = models.ForeignKey(Link)
  score = models.IntegerField(choices=SCORE_CHOICES)
  comment = models.TextField(blank=True)

  def __unicode__(self):
    return ' '.join((self.user.username, self.link.name))

  class Meta:
    unique_together = ('user', 'link')


class TrophyCase(models.Model):
  user = models.ForeignKey(CoreUser)
  trophy = models.ForeignKey(Trophy)
  date_earned = models.DateField()

  def __unicode__(self):
    return ' '.join((self.user.sid, self.trophy.name))


class LinkLibrary(models.Model):
  name = models.CharField(max_length=128)
  desc = models.CharField(max_length=256) # completely arbitrary max_length
  tags = models.ManyToManyField(Tag, verbose_name='user-specified tags')
  user = models.ForeignKey(CoreUser)
  links = models.ManyToManyField(Link)

  def __unicode__(self):
    return ' '.join((self.user.username, self.name))

  class Meta:
    verbose_name_plural = 'link libraries'

class SearchLog(models.Model):
   user = models.CharField(max_length=100)
   date_queried = models.DateField()
   search_terms = models.CharField(max_length=200)
   search_tags = models.CharField(max_length=300)

   def __unicode__(self):
     return ' '.join((self.user, self.search_terms))

def check_for_trophy(sender, instance, **kwargs):
    user1 = instance.user
    if (SearchLog.objects.filter(user=user1).count() >= 2):
      user_object = CoreUser.objects.get(username=user1)
      custom_message = 'Congratulations %s, you have won a trophy' % user_object.first_name
      email1 = user_object.email
      send_mail(custom_message, 'Testing e-mail', 'trophy@layedintel.com', [email1], fail_silently=False)
      # I need to make the trophy type conditional eventually.
      # for now I will hard-code the trophy-type.
      trophy1 = Trophy.objects.get(pk=2)
      t = TrophyCase(user=user_object, trophy=trophy1, date_earned=datetime.datetime.now())
      t.save()

post_save.connect(check_for_trophy, sender=SearchLog)

