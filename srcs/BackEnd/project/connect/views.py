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

        if self._is_already_invited(sender_id, receiver_id):
            return Response({"message": "Already invited!"}, status=402)

        game = self._get_game_of_sender(sender_id)
        if game is None:
            return Response({"message": "Sender is not part of any game"}, status=401)

        receiver_client = Client.objects.get(user__id=receiver_id)
        if game.is_player(receiver_client):
            return Response({"message": "Receiver already joined game"}, status=400)

        self._create_and_save_invitation(sender_id, receiver_id, game.id)
        return Response({"message": "Invite success!"}, status=status.HTTP_200_OK)

    def _is_already_invited(self, sender_id, receiver_id):
        try:
            InvitationQueue.objects.get(sender_id=sender_id, receiver_id=receiver_id)
            return True
        except InvitationQueue.DoesNotExist:
            return False

    def _get_game_of_sender(self, sender_id):
        try:
            return Game.objects.get(players__client__user__id=sender_id)
        except Game.DoesNotExist:
            return None

    def _create_and_save_invitation(self, sender_id, receiver_id, game_id):
        invite = InvitationQueue.objects.create(sender_id=sender_id, receiver_id=receiver_id, game_id=game_id)
        invite.save()

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