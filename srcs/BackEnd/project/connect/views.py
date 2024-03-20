from rest_framework.views import APIView
from rest_framework.response import Response
from .models import InvitationQueue
from drf_yasg.utils import swagger_auto_schema #swagger
from swagger.serializer import InviteSerializer

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
            invite = InvitationQueue.objects.create(sender_id=sender_id, receiver_id=receiver_id)
            invite.save()
            return Response(status=200, data={"message": "invite success"})