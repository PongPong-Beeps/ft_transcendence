from django.db import models

class Game(models.Model):
    score_a = models.IntegerField(default=0)
    score_b = models.IntegerField(default=0)
    type = models.CharField(max_length=20) #one_to_one or "tournament"
    mode = models.CharField(max_length=20) #easy or hard
    
    # webSocket별로 게임에 참여하려면 player들을 Clinet로 바꿀지 고민
    # player1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='player1')
    # player2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='player2')
    # player3 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='player3')
    # player4 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='player4')
    
    player1 = models.CharField(max_length=100, default='')
    player2 = models.CharField(max_length=100, default='')
    player3 = models.CharField(max_length=100, default='')
    player4 = models.CharField(max_length=100, default='')
    
    is_full = models.BooleanField(default=False)
    
    #빈 플레이어 슬롯을 찾아서 반환
    def get_empty_player_slot(self):
        for player_slot in ['player1', 'player2', 'player3', 'player4']:
            if getattr(self, player_slot) == '':
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