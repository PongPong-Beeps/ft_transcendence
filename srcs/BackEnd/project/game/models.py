from django.db import models
from connect.models import Client
from channels.db import database_sync_to_async
    
class Game(models.Model):
    score_a = models.IntegerField(default=0)
    score_b = models.IntegerField(default=0)
    type = models.CharField(max_length=20) #one_to_one or "tournament"
    mode = models.CharField(max_length=20) #easy or hard
    
    # webSocket별로 게임에 참여하려면 player들을 Clinet로 바꿀지 고민
    player1 = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='game_as_player1')
    player2 = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='game_as_player2')
    player3 = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='game_as_player3')
    player4 = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='game_as_player4')
    
    p1_ready = models.BooleanField(default=False)
    p2_ready = models.BooleanField(default=False)
    p3_ready = models.BooleanField(default=False)
    p4_ready = models.BooleanField(default=False)
    
    is_full = models.BooleanField(default=False)
    
    def is_player(self, player) :
        if player == self.player1 or player == self.player2 or player == self.player3 or player == self.player4:
            return True
        else:
            return False
    
    #빈 플레이어 슬롯을 찾아서 반환
    async def get_empty_player_slot(self):
        for player_slot in ['player1', 'player2', 'player3', 'player4']:
            if await database_sync_to_async(getattr)(self, player_slot) is None:
                return player_slot
        return None
    
    def check_full(self):
        if self.type == 'one_to_one':
            if self.player1 and self.player2:
                self.is_full = True
                self.save()
            else:
                self.is_full = False
                self.save()
        elif self.type == 'tournament':
            if self.player1 and self.player2 and self.player3 and self.player4:
                self.is_full = True
                self.save()
            else:
                self.is_full = False
                self.save()