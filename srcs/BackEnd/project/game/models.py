from django.db import models
from connect.models import Client
from channels.db import database_sync_to_async
from user.views import get_image
from user.models import User
import random
import math

class Player(models.Model):
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='player')
    is_ready = models.BooleanField(default=False)
    channel_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)


class Game(models.Model):
    is_gameRunning = models.BooleanField(default=False)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='game_winner')
    
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
            elif count_player == 1:
                self.is_full = False
                self.save()
            elif count_player == 0:
                self.delete()
        else : #'tournament':
            if count_player == 4:
                self.is_full = True
                self.save()
            elif count_player == 0:
                self.delete()
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
            print('player does not exist')
            
    def all_players_ready(self):
        if self.is_full:
            if all(player.is_ready for player in self.players.all()):
                for player in self.players.all():
                    player.is_ready = False
                    player.save()
                return True
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
            self.round3 = Round.objects.create(player1=None, player2=None) #round1, round2 종료시 winner를 저장
        self.is_gameRunning = True
        self.save()
    
    def get_next_round(self):
        rounds = [self.round1, self.round2, self.round3]
        for round in rounds:
            if round and not round.is_roundEnded:
                return round
        return None

class Paddle():
    def __init__(self):
        self.x = 0
        self.y = 0
        self.direction = 'stop'
        
        #패들 고정값
        self.width = 20
        self.height = 150
        self.speed = 5
        self.player_area = 50
    
    async def change_direction(self, key):
        self.direction = key
        
    def move_paddle(self, canvas_height):
        if self.direction == 'stop':
            return
        elif self.direction == 'up':
            self.y = max(self.y - self.speed, 0)
        elif self.direction == 'down':
            self.y = min(self.y + self.speed, canvas_height - self.height)

class Ball:
    def __init__(self, radius=5, speed=1, to='random', WIDTH=500, HEIGHT=500):
        self.x = WIDTH/2
        self.y = HEIGHT/2
        self.dirX, self.dirY = self.get_random_direction(to)
        self.is_ball_moving = False
        
        #볼 고정값
        self.radius = radius
        self.speed = speed

    def get_random_direction(self, to='random'):
        # 20도에서 40도를 라디안으로 변환
        min_angle = 20 * math.pi / 180
        max_angle = 40 * math.pi / 180
        
        # 랜덤 각도 생성
        angle = random.uniform(min_angle, max_angle)
        
        if to == 'player_1':
            dirX = -math.cos(angle)
            dirY = -math.sin(angle)
        elif to == 'player_2':
            dirX = math.cos(angle)
            dirY = -math.sin(angle)
        else: #random
            dirX = math.cos(angle) * (1 if random.random() < 0.5 else -1)
            dirY = math.sin(angle) * (1 if random.random() < 0.5 else -1)
        
        return dirX, dirY

#Ball클래스 상속
class Item:
    def __init__(self, to='random', WIDTH=1000, HEIGHT=500):
        self.x = WIDTH/2
        self.y = HEIGHT/2
        self.dirX, self.dirY = Ball().get_random_direction(to)
        self.radius = 20
        self.speed = 2.5
        
class Slot:
    def __init__(self):
        self.status = False
    
    def __str__(self):
        return str(self.status)

class Sound:
    def __init__(self):
        self.pong = False
        self.item = False
        self.b_add = False #ball 추가
        self.b_up = False #ball 속도 증가
        self.p_down = False #paddle 길이 감소
        self.out = False

class Round(models.Model):
    is_roundEnded = models.BooleanField(default=False)
    
    #서버 로직 계산을 위한 고정 크기
    width = 1000
    height = 500
    
    sound = Sound()
    
    paddle_1 = Paddle()
    paddle_2 = Paddle()
    
    balls = [ Ball() ]
    
    item = None
        
    slot_1 = Slot()
    slot_2 = Slot()
    
    heart_1 = models.IntegerField(default=5)
    heart_2 = models.IntegerField(default=5)
    
    player1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_player1')
    player2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_player2')
    
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