from django.conf import settings
from django.db import models
from django.contrib import auth


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
    return self.name

  class Meta:
    verbose_name_plural = 'trophies'


class Tag(models.Model):
  name = models.CharField(max_length=50, unique=True)

  def __unicode__(self):
    return self.name


class Link(models.Model):
  name = models.CharField(max_length=50)
  url = models.URLField() # do we want verify_exists=True?
  tags = models.ManyToManyField(Tag, verbose_name='default tags')

  def __unicode__(self):
    return self.name


class CoreUser(auth.models.User):
  sid = models.CharField(max_length=20)
  phone_number = models.PositiveSmallIntegerField()
  skin = models.ForeignKey(Skin)
  trophies = models.ManyToManyField(Trophy, through='TrophyCase')
  links = models.ManyToManyField(Link, through='LinkLibrary')

  def __unicode__(self):
    #return self.sid
    return ' '.join((self.username, self.sid))


class TrophyCase(models.Model):
  user = models.ForeignKey(CoreUser)
  trophy = models.ForeignKey(Trophy)
  date_earned = models.DateField()

  def __unicode__(self):
    return ' '.join((self.user.sid, self.trophy.name))


class LinkLibrary(models.Model):
  user = models.ForeignKey(CoreUser)
  link = models.ForeignKey(Link)
  tags = models.ManyToManyField(Tag, verbose_name='user-specified tags')

  def __unicode__(self):
    return ' '.join((self.user.sid, self.link.name))

  class Meta:
    verbose_name_plural = 'link libraries'

