from rest_framework.views import APIView
from rest_framework.response import Response
from .models import InvitationQueue, Client
from drf_yasg.utils import swagger_auto_schema #swagger
from swagger.serializer import InviteSerializer
from game.models import Game
from user.models import User
from rest_framework import status

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
            return Response({"message": "Already invitied!"}, status=status.HTTP_400_BAD_REQUEST) #이미 초대했을 때
        except InvitationQueue.DoesNotExist:
            try :
                game = Game.objects.get(players__client__user__id=sender_id)                
            except Game.DoesNotExist:
                return Response({"message": "Sender is not consist of game"}, status=status.HTTP_400_BAD_REQUEST) #게임에 속하지 않은 유저가 초대할 때
                        
            receiver_client = Client.objects.get(user__id=receiver_id)
            if game.is_player(receiver_client):
                return Response({"message": "Receiver already joined game"}, status=status.HTTP_400_BAD_REQUEST) #이미 해당 게임에 참가한 유저가 초대받을 때
            
            invite = InvitationQueue.objects.create(sender_id=sender_id, receiver_id=receiver_id, game_id=game.id)
            invite.save()
            return Response({"message": "Invite success!"}, status=status.HTTP_200_OK) #초대 성공

        except Exception as e:
            return Response({"message": "Error: " + str(e)}, status=status.HTTP_400_BAD_REQUEST) #그 외의 에러

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
            return Response({"message": "Refuse success!"}, status=status.HTTP_200_OK)
        except InvitationQueue.DoesNotExist:
            return Response({"message": "Invite does not exist!"}, status=status.HTTP_400_BAD_REQUEST)