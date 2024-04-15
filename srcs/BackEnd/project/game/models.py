from django.db import models
from connect.models import Client
from channels.db import database_sync_to_async
from user.views import get_image
from user.models import User
import random
import math
import os

WIDTH = int(os.getenv('WIDTH'))
HEIGHT = int(os.getenv('HEIGHT'))

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
    
    def is_player(self, client) :
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
    
    def do_ready(self, client): 
        player = self.players.get(client=client)
        if player.is_ready == True:
            player.is_ready = False
            player.save()
        else:
            player.is_ready = True 
            player.save()
    
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
                
    def entry_player(self, client, channel_name):
        player = Player.objects.create(client=client, channel_name=channel_name)
        player.save()
        self.players.add(player)
        self.check_full()
        self.save()

    def exit_player(self, channel_name):
        try :
            player = self.players.get(channel_name=channel_name)
            player.delete()
            self.check_full()
            self.save()
            if self.players.count() == 0:
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
    def __init__(self, player='player1', mode='default'):
        #패들 고정값
        self.width = float(os.getenv('PADDLE_WIDTH'))
        self.height = float(os.getenv('PADDLE_HEIGHT')) / 2 if mode == 'easy' else float(os.getenv('PADDLE_HEIGHT')) 
        self.speed = float(os.getenv('PADDLE_SPEED'))
        self.player_area = float(os.getenv('PADDLE_PLAYER_AREA'))
        #패들 가변값
        self.x = self.player_area if player == 'player1' else WIDTH - self.width - self.player_area
        self.y = (HEIGHT / 2) - (self.height) / 2
        self.direction = 'stop'
        
    async def change_direction(self, key):
        self.direction = key
        
    def move_paddle(self):
        if self.direction == 'stop':
            return
        elif self.direction == 'up':
            self.y = max(self.y - self.speed, 0)
        elif self.direction == 'down':
            self.y = min(self.y + self.speed, HEIGHT - self.height)


class Ball:
    def __init__(self, type='default', to='random'):
        self.x = WIDTH / 2
        self.y = HEIGHT / 2
        self.dirX, self.dirY = self.get_random_direction(to)
        self.is_ball_moving = False
        
        #볼 고정값
        self.radius = float(os.getenv('BALL_RADIUS')) * 1.5 if type == 'add' else float(os.getenv('BALL_RADIUS'))
        self.speed = float(os.getenv('BALL_SPEED')) * 2 if type == 'easy' else float(os.getenv('BALL_SPEED')) / 1.5 if type =='add' else float(os.getenv('BALL_SPEED'))

    def get_random_direction(self, to='random'):
        # 20도에서 40도를 라디안으로 변환
        add_min_angle = -40 * math.pi / 180
        min_angle = 20 * math.pi / 180
        max_angle = 40 * math.pi / 180
        
        # 랜덤 각도 생성
        angle = random.uniform(min_angle, max_angle)
        add_angle = random.uniform(add_min_angle, max_angle)
        
        if to == 'player1':
            dirX = -math.cos(add_angle)
            dirY = math.sin(add_angle) * (1 if random.random() < 0.5 else -1)
        elif to == 'player2':
            dirX = math.cos(add_angle)
            dirY = math.sin(add_angle) * (1 if random.random() < 0.5 else -1)
        else: #random
            dirX = math.cos(angle) * (1 if random.random() < 0.5 else -1)
            dirY = math.sin(angle) * (1 if random.random() < 0.5 else -1)
        
        return dirX, dirY

class Item:
    def __init__(self, to='random'):
        self.x = WIDTH / 2
        self.y = HEIGHT / 2
        self.dirX, self.dirY = Ball().get_random_direction(to)
        self.radius = float(os.getenv('ITEM_RADIUS'))
        self.speed = float(os.getenv('ITEM_SPEED'))
        
class Slot:
    def __init__(self):
        self.status = False
        self.item_type = None
    
    def __str__(self):
        return str(self.status)

class Sound:
    def __init__(self):
        self.pong = False
        self.item = False
        self.b_add = False #ball 추가
        self.b_up = False #ball 속도 증가
        self.p_down = False #paddle 길이 감소
        self.p_up = False #paddle 길이 증가
        self.out = False

class Round(models.Model):
    is_roundEnded = models.BooleanField(default=False)            
    player1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_player1')
    player2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_player2')
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rounds_winner')
    created_at = models.DateTimeField(auto_now_add=True)