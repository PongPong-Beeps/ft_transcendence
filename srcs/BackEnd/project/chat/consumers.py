import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import ChannelGroup

class ChatConsumer(WebsocketConsumer):
    
    def connect(self):
        self.room_group_name = 'interaction'
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        ChannelGroup.objects.create(channel_name=self.channel_name, group_name=self.room_group_name)
        self.accept()
        self.send(text_data=json.dumps({
            'channel_name': self.channel_name
        }))
        
    def disconnect(self, message):
        
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        ChannelGroup.objects.filter(channel_name=self.channel_name, group_name=self.room_group_name).delete()

    
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        message = text_data_json['message']
        sender = text_data_json['sender']
        # sender = self.scope['user'].username  # 예시로 사용자 이름을 가져옴
        
        if type == "chat_message":
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type':"chat_message",
                    'message':message,
                    'sender': sender,
                }
            )
    
    def chat_message(self,event):
        type = event['type']
        message = event['message']
        sender = event['sender']
        

        self.send(text_data=json.dumps({
            'type':type,
            'message':message,
            'sender': sender,
        }))