from rest_framework.views import APIView
from rest_framework.response import Response
from .models import InvitationQueue, Client
from drf_yasg.utils import swagger_auto_schema #swagger
from swagger.serializer import InviteSerializer
from game.models import Game
from user.models import User

# connect/invite/ #초대 대기열 생성하는 뷰
class InviteView(APIView):
    @swagger_auto_schema(
        tags=['Invite'], 
        request_body=InviteSerializer,
    )
    def post(self, request):
        sender_id = request.data['sender']
        receiver_id = request.data['receiver']
        try:
            invite = InvitationQueue.objects.get(sender_id=sender_id, receiver_id=receiver_id)
            return Response(status=400, data={"message": "already invited"})
        except InvitationQueue.DoesNotExist:
            # players 필드에 속한 Player 객체 중 client 필드가 우리가 가지고 있는 client 객체와 일치하는 것
            try :
                sender_user = User.objects.get(id=sender_id)
                sender_client = Client.objects.get(user=sender_user)
                game = Game.objects.get(players__client=sender_client)
            except Game.DoesNotExist:
                return Response(status=400, data={"message": "sender is not consist of game"})
            invite = InvitationQueue.objects.create(sender_id=sender_id, receiver_id=receiver_id, game_id=game.id)
            invite.save()
            return Response(status=200, data={"message": "invite success"})
        
# connect/invite/refuse #초대 거절에 따른 초대대기열 삭제
class InviteRefuseView(APIView):
    @swagger_auto_schema(
        tags=['Invite'], 
        request_body=InviteSerializer,
    )
    def post(self, request):
        sender_id = request.data['sender']
        receiver_id = request.data['receiver']
        try:
            invite = InvitationQueue.objects.get(sender_id=sender_id, receiver_id=receiver_id)
            invite.delete()
            return Response(status=200, data={"message": "refuse success"})
        except InvitationQueue.DoesNotExist:
            return Response(status=400, data={"message": "invite does not exist"})