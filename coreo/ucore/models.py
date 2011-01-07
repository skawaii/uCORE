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


class Tag(models.Model):
  name = models.CharField(max_length=50, unique=True)

  def __unicode__(self):
    return self.name


class Trophy(models.Model):
  name = models.CharField(max_length=50)
  desc = models.CharField('short description', max_length=100)
  tag = models.ForeignKey(Tag)
  file_path = models.FilePathField('path to image file', path=settings.MEDIA_ROOT + 'trophies')

  def __unicode__(self):
    #  return self.name
    return '%s %s %s' % (self.name, self.desc, self.file_path)

  class Meta:
    verbose_name_plural = 'trophies'


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


class Notification(models.Model):
  TYPE_CHOICES = (
      ('TR', 'Trophy Notification'),
      ('EP', 'Expired Password'),
      ('NC', 'New Site Content'),
  )
  user = models.ForeignKey(CoreUser)
  type = models.CharField(max_length=20, choices=TYPE_CHOICES)
  message = models.CharField(max_length=200)

  def __unicode__(self):
    return '%s  %s' % (self.user.username, self.message) 


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
  # user = models.CharField(max_length=100)
   user = models.ForeignKey(CoreUser)
   date_queried = models.DateField()
   search_terms = models.CharField(max_length=200)
   search_tags = models.ManyToManyField(Tag)

   def __unicode__(self):
     return ' '.join((self.user.username, self.search_terms))

### Signal Registration ###
from coreo.ucore import signals
post_save.connect(signals.check_for_trophy, sender=SearchLog)
post_save.connect(signals.send_trophy_email, sender=TrophyCase)

