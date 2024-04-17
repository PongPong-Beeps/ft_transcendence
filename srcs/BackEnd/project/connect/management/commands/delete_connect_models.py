from django.core.management.base import BaseCommand
from django.apps import apps

class Command(BaseCommand):
    help = 'Deletes all Client and InvitationQueue instances'

    def handle(self, *args, **options):
        Client = apps.get_model('connect', 'Client')
        InvitationQueue = apps.get_model('connect', 'InvitationQueue')

        Client.objects.all().delete()
        InvitationQueue.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Successfully deleted all Client and InvitationQueue instances'))