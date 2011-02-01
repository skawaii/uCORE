import datetime

from django.conf import settings
from django.contrib import auth
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import models


class Skin(models.Model):
  name = models.CharField(max_length=50)
  file_path = models.FilePathField('path to CSS file', path=settings.MEDIA_ROOT + 'skins')

  def __unicode__(self):
    return self.name


class Tag(models.Model):
  TAG_CHOICES = (
      ('T', 'Trophy'),
      ('P', 'Public')
  )

  name = models.CharField(max_length=50, unique=True)
  type = models.CharField(max_length=1, choices=TAG_CHOICES)

  def __unicode__(self):
    return self.name


class Trophy(models.Model):
  name = models.CharField(max_length=50)
  desc = models.CharField('short description', max_length=100, help_text='Include details on how to earn this trophy.')
  tag = models.ForeignKey(Tag)
  earning_req = models.PositiveSmallIntegerField(help_text='Total actions required for earning this trophy.')
  file_path = models.FilePathField('path to image file', path=settings.MEDIA_ROOT + 'trophies')

  def __unicode__(self):
    return self.name

  class Meta:
    verbose_name_plural = 'trophies'


class POC(models.Model):
  first_name = models.CharField(max_length=20)
  last_name = models.CharField(max_length=20)
  phone_number = models.PositiveSmallIntegerField()
  email = models.EmailField(unique=True)

  def __unicode__(self):
    return self.get_full_name()

  def get_full_name(self):
    return ' '.join((self.first_name, self.last_name))

  class Meta:
    verbose_name_plural = 'POCs'


class Link(models.Model):
  name = models.CharField(max_length=50)
  desc = models.CharField(max_length=256) # completely arbitrary max_length
  url = models.URLField(unique=True) # do we want verify_exists=True?
  tags = models.ManyToManyField(Tag, verbose_name='default tags')
  poc = models.ForeignKey(POC)

  def __unicode__(self):
     return self.name


class CoreUser(auth.models.User):
  sid = models.CharField(max_length=20)
  phone_number = models.PositiveSmallIntegerField()
  skin = models.ForeignKey(Skin)
  trophies = models.ManyToManyField(Trophy, through='TrophyCase')
  # links = models.ManyToManyField(Link, through='LinkLibrary')

  def __unicode__(self):
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
    return '%s  %s  %s' % (self.user.username, self.message, self.type) 


class RatingFK(models.Model):
  user = models.ForeignKey(CoreUser)
  link = models.ForeignKey(Link, null=True, blank=True)
  link_library = models.ForeignKey('LinkLibrary', null=True, blank=True)

  def __unicode__(self):
    return ' '.join((self.user.username, self.link.name if self.link else self.link_library.name))

  # override the save method so that we can make sure there isn't a
  # Link and LinkLibrary FK (can only 1 or the other)
  def save(self, *args, **kwargs):
    if self.link and self.link_library:
      raise ValidationError('A RatingFK cannot contain both a Link and a LinkLibrary reference.')

    super(RatingFK, self).save(*args, **kwargs)

  class Meta:
    unique_together = (('user', 'link'), ('user', 'link_library'))
    verbose_name_plural = 'Rating FKs'


class Rating(models.Model):
  SCORE_CHOICES = (
      (1, '1 - Utter Junk'),
      (2, '2 - Junk'),
      (3, '3 - Ok'),
      (4, '4 - Good'),
      (5, '5 - Very Good')
  )

  rating_fk = models.ForeignKey(RatingFK, unique=True)
  score = models.IntegerField(choices=SCORE_CHOICES)
  comment = models.TextField(blank=True)

  def __unicode__(self):
    return str(self.rating_fk)


class TrophyCase(models.Model):
  user = models.ForeignKey(CoreUser)
  trophy = models.ForeignKey(Trophy)
  count = models.PositiveSmallIntegerField(default=1)
  earned = models.BooleanField(default=False)
  date_earned = models.DateField(blank=True, null=True)

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
  user = models.ForeignKey(CoreUser)
  date_queried = models.DateField()
  search_terms = models.CharField(max_length=200)
  search_tags = models.ManyToManyField(Tag)

  def __unicode__(self):
    return ' '.join((self.user.username, self.search_terms))


### Trophy Progress models ###
#class TrophyProgress(models.Model):
#  user = models.ForeignKey(CoreUser)
#  trophy = models.ForeignKey(Trophy)
#  #count = models.PositiveSmallIntegerField()
#  #total_needed = models.PositiveSmallIntegerField()
#  date_awarded = models.DateField()
#
#  objects = InheritanceManager()
#
#
#class RatingTrophyProgress(TrophyProgress):
#  pass


### Signal Registration ###
from django.db.models.signals import post_save
from coreo.ucore import signals

post_save.connect(signals.check_for_trophy, sender=SearchLog)
post_save.connect(signals.send_trophy_email, sender=TrophyCase)
#XXX add a post_save signal on save_user() that awards the registration trophy and take that logic out of save_user()
post_save.connect(signals.initialize_new_user, sender=CoreUser)

