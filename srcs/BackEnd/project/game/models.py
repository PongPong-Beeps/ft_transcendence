from django.db import models
from connect.models import Client
from channels.db import database_sync_to_async
from user.views import get_image    
class Player(models.Model):
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='player')
    is_ready = models.BooleanField(default=False)

class Game(models.Model):
    score_a = models.IntegerField(default=0)
    score_b = models.IntegerField(default=0)
    
    type = models.CharField(max_length=20) #one_to_one or "tournament"
    mode = models.CharField(max_length=20) #easy or hard
    
    players = models.ManyToManyField(Player, related_name='player_as_game')

    is_full = models.BooleanField(default=False)
    
    def is_player(self, client) : #지금 필요없는데, 필요하면 쓰면될듯?
        status = self.players.filter(client=client).exists()
        if status :
            return True
        else :
            return False
    
    def get_players_nickname(self):
        players_nickname = [''] * 4
        for i, player in enumerate(self.players.all()): #enumerate : 인덱스와 값을 동시에 줌
            players_nickname[i] = player.client.user.nickname
        return players_nickname

    def get_players_image(self):
        players_image = [''] * 4
        for i, player in enumerate(self.players.all()): #enumerate : 인덱스와 값을 동시에 줌
            user = player.client.user
            players_image[i] = get_image(user)
        return players_image
    
    def get_players_ready(self) :
        players_ready = [''] * 4
        for i, player in enumerate(self.players.all()): #enumerate : 인덱스와 값을 동시에 줌
            players_ready[i] = player.is_ready
        return players_ready
    
    def do_ready(self, client): #플레이어가 준비/준비해제
        player = self.players.get(client=client)
        if player.is_ready == True: #준비 상태면, 준비해제하기로
            player.is_ready = False
            player.save()
        else: #준비해제 상태면, 준비하기로
            player.is_ready = True 
            player.save()
        #self.save()를 따로 안해도 ManyToMany로 이어져 있어서 players는 자동으로 업데이트 된다.
    
    def check_full(self):
        count_player = self.players.count()
        if self.type == 'one_to_one':
            if count_player == 2:
                self.is_full = True
                self.save()
            else:
                self.is_full = False
                self.save()
        else : #'tournament':
            if count_player == 4:
                self.is_full = True
                self.save()
            else:
                self.is_full = False
                self.save()
                
    def entry_player(self, client): #플레이어 입장
        player = Player.objects.create(client=client)
        player.save()
        self.players.add(player)
        self.check_full() #플레이어가 들어오면 게임의 is_full 상태도 변경
        self.save()

    def exit_player(self, client): #플레이어 퇴장
        try :
            player = self.players.get(client=client)
            player.delete() #player 객체 삭제하면 자동으로 players에서도 삭제됨
            self.check_full() #플레이어가 나가면 게임의 is_full 상태도 변경
            self.save()
            if self.players.count() == 0: #플레이어가 없으면 게임 삭제
                self.delete()
        except :
            print(f'player {client.user} does not exist')
            
    def verify_players(self):
        print('start verify players')
        for player in self.players.all():
            try :
                getattr(player, 'client')
                print('real? ', player.client.user)
            except AttributeError:
                print('AttributeError')
                player.delete() #player 객체 삭제하면 자동으로 players에서도 삭제됨
                self.check_full() #플레이어가 나가면 게임의 is_full 상태도 변경
                self.save()
                print('player delete ok')
                if self.players.count() == 0: #플레이어가 없으면 게임 삭제
                    self.delete()
                    print('room delete ok')