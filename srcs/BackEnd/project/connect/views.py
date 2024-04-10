from rest_framework.views import APIView
from rest_framework.response import Response
from .models import InvitationQueue, Client
from drf_yasg.utils import swagger_auto_schema #swagger
from swagger.serializer import InviteSerializer
from game.models import Game
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

        if self.is_already_invited(receiver_id):
            return Response({"message": "Already invited!"}, status=402)

        sender_game = self.get_game_by_user(sender_id)
        if sender_game is None:
            return Response({"message": "Sender is not part of any game"}, status=401)
        
        if sender_game.is_player(Client.objects.get(user_id=receiver_id)):
            return Response({"message": "Receiver already joined in sender game"}, status=400)

        receiver_game = self.get_game_by_user(receiver_id)
        if receiver_game:
            return Response({"message": "Receiver already joined game"}, status=403)
        
        self.create_and_save_invitation(sender_id, receiver_id, sender_game.id)
        return Response({"message": "Invite success!"}, status=status.HTTP_200_OK)


    def is_already_invited(self, receiver_id):
        return InvitationQueue.objects.filter(receiver_id=receiver_id).exists()

    def get_game_by_user(self, user_id):
        return Game.objects.filter(players__client__user__id=user_id).first()

    def create_and_save_invitation(self, sender_id, receiver_id, game_id):
        InvitationQueue.objects.create(sender_id=sender_id, receiver_id=receiver_id, game_id=game_id)


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