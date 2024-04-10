from . import views
from .models import MatchHistory
from rest_framework import serializers

class BlackListSerializer(serializers.ModelSerializer):
    class Meta:
        model = views.User
        fields = ['id', 'nickname']
        
class FriendListSerializer(serializers.ModelSerializer):
    class Meta:
        model = views.User
        fields = ['nickname']
        
class MatchHistorySerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    opponent = serializers.CharField(source='nick_opponent')
    matchType = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    
    def get_date(self, obj):
        return obj.datetime.strftime('%y-%m-%d')
    
    def get_matchType(self, obj):
        return 'T' if obj.tournament else '1vs1'
    
    def get_result(self, obj):
        return '승' if obj.result else '패'
    class Meta:
        model = MatchHistory
        fields = ['date', 'opponent', 'matchType', 'result']
