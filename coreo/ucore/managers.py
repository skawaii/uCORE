from django.db import models
#from django.db.models.query import QuerySet


class TagManager(models.Manager):
  def get_by_natural_key(self, id, name):
    """
    Even though this is doing the same thing as the default Manager, we need
    this so that we can deserialize the Tag JSON objs after we've added the
    (id, name) as its natural key during serialization. Having the name field
    in the JSON obj is a nice convenience on the front-end.
    """
    return self.get(pk=id)


#class InheritanceQuerySet(QuerySet):
#  ''' Written by Jeff Elmore and it's awesome.
#      See http://jeffelmore.org/2010/11/11/automatic-downcasting-of-inherited-models-in-django/.
#  '''
#  def select_subclasses(self, *subclasses):
#    if not subclasses:
#      subclasses = [o for o in dir(self.model)
#                    if isinstance(getattr(self.model, o), SingleRelatedObjectDescriptor)\
#                    and issubclass(getattr(self.model,o).related.model, self.model)]
#
#    new_qs = self.select_related(*subclasses)
#    new_qs.subclasses = subclasses
#
#    return new_qs
#
#  def _clone(self, klass=None, setup=False, **kwargs):
#    try:
#      kwargs.update({'subclasses': self.subclasses})
#    except AttributeError:
#      pass
#
#    return super(InheritanceQuerySet, self)._clone(klass, setup, **kwargs)
#
#  def iterator(self):
#    iter = super(InheritanceQuerySet, self).iterator()
#
#    if getattr(self, 'subclasses', False):
#      for obj in iter:
#        obj = [getattr(obj, s) for s in self.subclasses if getattr(obj, s)] or [obj]
#        yield obj[0]
#      else:
#        for obj in iter:
#          yield obj
#
#
#class InheritanceManager(models.Manager):
#  def get_query_set(self):
#    return InheritanceQuerySet(model=self.model)
#
#  def select_subclasses(self, *subclasses):
#    return self.get_query_set().select_subclasses(*subclasses)

