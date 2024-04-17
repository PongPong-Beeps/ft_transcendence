from django.core.management.base import BaseCommand
from django.apps import apps

class Command(BaseCommand):
    help = 'Deletes all Player, Round, and Game instances'

    def handle(self, *args, **options):
        Player = apps.get_model('game', 'Player')
        Round = apps.get_model('game', 'Round')
        Game = apps.get_model('game', 'Game')

        Player.objects.all().delete()
        Round.objects.all().delete()
        Game.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Successfully deleted all Player, Round, and Game instances'))