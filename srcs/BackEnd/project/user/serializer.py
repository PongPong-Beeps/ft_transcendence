from . import views
from .models import MatchHistory #, User
from rest_framework import serializers

# Modelserializer : Meta 클래스를 통해 모델과 필드를 연결
class BlackListSerializer(serializers.ModelSerializer):
    class Meta:
        model = views.User #이부분도 모델에서 import로 수정예정
        fields = ['nickname']
        
class FriendListSerializer(serializers.ModelSerializer):
    class Meta:
        model = views.User
        fields = ['nickname']
        
class MatchHistorySerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField() #date 필드를 변형하기 위한 작업
    opponent = serializers.CharField(source='nick_opponent')
    matchType = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    
    #SerializerMethodField() : 모델의 필드를 직렬화하기 위한 메소드
    #아래 get_ 함수들과 같이 쓰인다.
    #이름을 바꿨다면 obj.뒤에는 원형을 적는다.
    def get_date(self, obj):
        return obj.datetime.strftime('%y-%m-%d')
    
    def get_matchType(self, obj):
        return 'T' if obj.tournament else '1vs1'
    
    def get_result(self, obj):
        return '승' if obj.result else '패'
    class Meta:
        model = MatchHistory
        fields = ['date', 'opponent', 'matchType', 'result']
