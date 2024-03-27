from django.db import models
from connect.models import Client
from channels.db import database_sync_to_async
from user.views import get_image
from user.models import User

class Player(models.Model):
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='player')
    is_ready = models.BooleanField(default=False)
    height = models.FloatField(default=0.0)
    width = models.FloatField(default=0.0)
    channel_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)


class Game(models.Model):
    is_gameRunning = models.BooleanField(default=False)
    
    type = models.CharField(max_length=20) #one_to_one or "tournament"
    mode = models.CharField(max_length=20) #easy or hard
    players = models.ManyToManyField(Player, related_name='player_as_game')
    
    round1 = models.ForeignKey('Round', on_delete=models.SET_NULL, null=True, blank=True, related_name='game_round1')
    round2 = models.ForeignKey('Round', on_delete=models.SET_NULL, null=True, blank=True, related_name='game_round2')
    round3 = models.ForeignKey('Round', on_delete=models.SET_NULL, null=True, blank=True, related_name='game_round3')

    is_full = models.BooleanField(default=False)
    
    def delete(self, *args, **kwargs):
        if self.round1:
            self.round1.delete()
        if self.round2:
            self.round2.delete()
        if self.round3:
            self.round3.delete()
        super().delete(*args, **kwargs)
    
    def is_player(self, client) : #지금 필요없는데, 필요하면 쓰면될듯?
        status = self.players.filter(client=client).exists()
        if status :
            return True
        else :
            return False
        
    def get_players_info(self):
        players_info = [{'nickname': '', 'image': '', 'ready': ''} for _ in range(4)]
        for i, player in enumerate(self.players.all().order_by('created_at').order_by('created_at')):
            user = player.client.user
            players_info[i]['nickname'] = user.nickname
            players_info[i]['image'] = get_image(user)
            players_info[i]['ready'] = player.is_ready
        return players_info
    
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
                
    def entry_player(self, client, channel_name): #플레이어 입장
        player = Player.objects.create(client=client, channel_name=channel_name)
        player.save()
        self.players.add(player)
        self.check_full() #플레이어가 들어오면 게임의 is_full 상태도 변경
        self.save()

    def exit_player(self, channel_name): #플레이어 퇴장
        try :
            player = self.players.get(channel_name=channel_name)
            player.delete() #player 객체 삭제하면 자동으로 players에서도 삭제됨
            self.check_full() #플레이어가 나가면 게임의 is_full 상태도 변경
            self.save()
            if self.players.count() == 0: #플레이어가 없으면 게임 삭제
                self.delete()
        except :
            print(f'player {client.user} does not exist')
            
    def all_players_ready(self):
        if self.is_full:
            return all(player.is_ready for player in self.players.all())
        else:
            return False
    
    def initialize_rounds(self):
        # 기존에 있는 round1, round2, round3 인스턴스가 있는지 확인하고, 있다면 삭제
        if self.round1:
            self.round1.delete()
            self.round1 = None
        if self.round2:
            self.round2.delete()
            self.round2 = None
        if self.round3:
            self.round3.delete()
            self.round3 = None
        players = list(self.players.all())
        if self.type == "one_to_one":
            # 'one_to_one' 게임 타입의 경우 한 개의 Round 인스턴스 생성
            round1 = Round.objects.create(
                player1=players[0].client.user, 
                player2=players[1].client.user
            )
            self.round1 = round1
        elif self.type == "tournament":
            # 'tournament' 게임 타입의 경우 두 개의 Round 인스턴스 생성
            round1 = Round.objects.create(
                player1=players[0].client.user, 
                player2=players[1].client.user
            )
            round2 = Round.objects.create(
                player1=players[2].client.user, 
                player2=players[3].client.user
            )
            self.round1 = round1
            self.round2 = round2
        self.is_gameRunning = True
        self.save()
        
    def initialize_player_size(self, client, width, height):
        player = self.players.filter(client=client).first()

        if player:
            player.height = height
            player.width = width
            player.save()
    
    def get_next_round(self):
        rounds = [self.round1, self.round2, self.round3]
        for round in rounds:
            if round and not round.is_roundEnded:
                return round
        return None

class Round(models.Model):
    is_roundEnded = models.BooleanField(default=False)
    
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    
    player1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_player1')
    player2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_player2')
    
    
    paddle1_x = models.FloatField(default=0.0)
    paddle1_y = models.FloatField(default=0.0)
    paddle2_x = models.FloatField(default=0.0)
    paddle2_y = models.FloatField(default=0.0)
    
    ball_1_x = models.FloatField(default=0.0)
    ball_1_y = models.FloatField(default=0.0)
    ball_2_x = models.FloatField(default=0.0)
    ball_2_y = models.FloatField(default=0.0)
    
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_winner')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def get_players(self):
        players = []
        if self.player1_id:
            try:
                player1 = User.objects.get(pk=self.player1_id)
                players.append(player1)
            except User.DoesNotExist:
                print("Player1 does not exist.")
        
        if self.player2_id:
            try:
                player2 = User.objects.get(pk=self.player2_id)
                players.append(player2)
            except User.DoesNotExist:
                print("Player2 does not exist.")
        
        return players