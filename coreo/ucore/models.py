import datetime

from django.conf import settings
from django.contrib import auth
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import models
from django.db.models.signals import post_save
from django.forms import ModelForm
from coreo.ucore.managers import TagManager

class Skin(models.Model):
  """
  The skin field.  Allows a user to specify a css file that represents
  the way they want his/her account to display
  """
  name = models.CharField(max_length=50)
  file_path = models.FilePathField('path to CSS file', path=settings.MEDIA_ROOT + 'skins')

  def __unicode__(self):
    return self.name


class Tag(models.Model):
  """
  The Tag model. This will be associated with either a Trophy or a Link.
  Two values are available : Trophy Tags and Public Tags.
  """
  TAG_CHOICES = (
      ('T', 'Trophy'),
      ('P', 'Public')
  )

  name = models.CharField(max_length=50, unique=True)
  type = models.CharField(max_length=1, choices=TAG_CHOICES, default='P')

  objects = TagManager()

  def __unicode__(self):
    return self.name

  def natural_key(self):
    return (self.pk, self.name)


class Trophy(models.Model):
  """
  The Trophy model. This is a table that represents trophies available to earn. 
  """
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
    return '%s %s' % (self.first_name, self.last_name)

  class Meta:
    verbose_name_plural = 'POCs'


class Link(models.Model):
  name = models.CharField(max_length=50)
  desc = models.CharField(max_length=256) # completely arbitrary max_length
  url = models.URLField(unique=True) # do we want verify_exists=True?
  tags = models.ManyToManyField(Tag, verbose_name='default tags')
  poc = models.ForeignKey(POC)

  def natural_key(self):
    return (self.pk, self.name)

  def __unicode__(self):
     return self.name


class Settings(models.Model):
  """
  All fields in this model should contain a ``default`` value and a ``help_text``.
  Providing a ``default`` value allows us to save a new CoreUser without bugging the user for their
  settings upon registering. The ``help_text`` is what will be the description on the settings page
  that the user will see.
  """
  wants_emails = models.BooleanField(default=True, help_text='Would you like to be notified of events via email?')
  # default value for skin set in save()
  skin = models.ForeignKey(Skin, blank=True, null=True, help_text='Customize the look and feel with skins.')

  def __unicode__(self):
    return 'settings %s' % self.pk

  def save(self, *args, **kwargs):
    if not self.skin: self.skin = Skin.objects.get(name='Default')

    super(Settings, self).save(*args, **kwargs)

  class Meta:
    verbose_name_plural = 'settings'


class CoreUser(auth.models.User):
  sid = models.CharField(max_length=20, unique=True)
  phone_number = models.CharField(max_length=255)
  settings = models.OneToOneField(Settings, null=True, blank=True)
  trophies = models.ManyToManyField(Trophy, through='TrophyCase')
  libraries = models.ManyToManyField('LinkLibrary', null=True, blank=True)
  # links = models.ManyToManyField(Link, through='LinkLibrary')

  def __unicode__(self):
    return '%s %s' % (self.username, self.sid)

  def save(self, *args, **kwargs):
    # create settings for newly created users
    if not self.settings: self.settings = Settings.objects.create()

    super(CoreUser, self).save(*args, **kwargs)


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
    return '%s %s' % (self.user.username, self.link.name if self.link else self.link_library.name)

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
  date_earned = models.DateField(blank=True, null=True)

  def __unicode__(self):
     return '%s %s' % (self.user.sid, self.trophy.name)


class LinkLibrary(models.Model):
  name = models.CharField(max_length=128)
  desc = models.CharField(max_length=256) # completely arbitrary max_length
  tags = models.ManyToManyField(Tag, verbose_name='user-specified tags')
  creator = models.ForeignKey(CoreUser)
  links = models.ManyToManyField(Link)

  def __unicode__(self):
    return '%s %s' % (self.creator.username, self.name)

  def natural_key(self):
    return (self.pk, self.name, self.links)

  class Meta:
    verbose_name_plural = 'link libraries'


class SearchLog(models.Model):
  user = models.ForeignKey(CoreUser)
  date_queried = models.DateField()
  search_terms = models.CharField(max_length=200)
  search_tags = models.ManyToManyField(Tag)

  def __unicode__(self):
    return '%s %s' % (self.user.username, self.search_terms)


### Signal Registration ###
from django.db.models.signals import post_delete, post_save
from coreo.ucore import signals

post_delete.connect(signals.delete_user_settings, sender=CoreUser)
post_save.connect(signals.check_for_trophy, sender=SearchLog)
post_save.connect(signals.send_notification_email, sender=Notification)
post_save.connect(signals.check_trophy_conditions, sender=TrophyCase)
post_save.connect(signals.initialize_new_user, sender=CoreUser)

