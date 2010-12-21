# A sample signal file that will be used for trophy earnings.

from django.db.models.signals import post_save
from django.dispatch import receiver
from coreo.ucore.models import SearchLog

@receiver(post_save, sender=SearchLog)
def my_handler(sender, **kwargs):
  # put stuff to determine if trophy is earned here.
  
