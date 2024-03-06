from . import views
from rest_framework import serializers

# Modelserializer : Meta 클래스를 통해 모델과 필드를 연결
class BlackListSerializer(serializers.ModelSerializer):
    # user_block = serializers.CharField(max_length=20)
    class Meta:
        model = views.User
        fields = ['nickname']