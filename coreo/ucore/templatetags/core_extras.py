from django import template
from coreo.ucore import utils

register = template.Library()

@register.simple_tag
def user_json(user):
  return utils.get_coreuser_json(user)