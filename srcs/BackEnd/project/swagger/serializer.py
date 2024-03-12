from rest_framework import serializers
from drf_yasg import openapi

#[POST] /api/user/me/image/ 내 프로필 이미지 변경을 위한 Serializer
class ChangeImageSerializer(serializers.Serializer):
    image = serializers.ImageField()

#[POST] nickname 입력을 위한 Serializer
class InputNickSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=20)
    
user_list_schema = {
  200: openapi.Response(
    description="200 OK",
    schema=openapi.Schema(
      type=openapi.TYPE_OBJECT,
      properties={
        'nickname': openapi.Schema(type=openapi.TYPE_STRING),
      }
    )
  ),
}

user_me_schema = {
  200: openapi.Response(
    description="200 OK",
    schema=openapi.Schema(
      type=openapi.TYPE_OBJECT,
      properties={
        'image': openapi.Schema(type=openapi.TYPE_STRING),
        'nickname': openapi.Schema(type=openapi.TYPE_STRING),
      }
    )
  ),
}

user_info_schema = {
        200: openapi.Response(
        description="200 OK", 
        schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties = {
            'image': openapi.Schema(type=openapi.TYPE_STRING),
            'nickname': openapi.Schema(type=openapi.TYPE_STRING),
            'total': openapi.Schema(type=openapi.TYPE_INTEGER),
            'easy': openapi.Schema(type=openapi.TYPE_INTEGER),
            'hard': openapi.Schema(type=openapi.TYPE_INTEGER),
            'friend': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            'block': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        }
        )),
        400: 'KeyNotFound',
        500: 'Server Error'
}