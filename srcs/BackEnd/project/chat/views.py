from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChannelGroup

class Index(APIView):
    def get(self, request):
        # 'interaction' 그룹에 속한 모든 채널의 이름을 조회
        channels_in_group = ChannelGroup.objects.filter(group_name='interaction').values_list('channel_name', flat=True)
        # 조회한 채널의 이름을 리스트로 변환 (쿼리셋을 직접 JSON 응답으로 변환할 수 없으므로)
        channels_list = list(channels_in_group)
        # 채널의 이름 리스트를 JSON 응답으로 반환
        return Response({"channels_in_group": channels_list})