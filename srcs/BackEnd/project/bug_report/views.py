from rest_framework.views import APIView
from rest_framework.response import Response
from .models import BugReport
from user.models import User

#/api/bug_report/
class BugReportView(APIView):
    def post(self, request):
        try:
            user_id = request.user.id
            user = User.objects.get(id=user_id)
            content = request.data.get('content')
            BugReport.objects.create(user=user, content=content)
            return Response(status=200)
        except:
            return Response(status=400)