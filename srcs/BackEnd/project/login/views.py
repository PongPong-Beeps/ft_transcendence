from django.shortcuts import redirect
from django.views import View
from django.http import HttpResponse, JsonResponse


class login42TestView(View):
    def get(self, request):  # 수정: get 메서드의 첫 번째 매개변수는 self여야 합니다.
        target_url = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-942fd4b0016fa5993b2a57b000789a0d9b6e6b05ef6a004724062905ea9dc440&redirect_uri=https%3A%2F%2F127.0.0.1%2Fauth&response_type=code'
        return redirect(target_url)  # 수정: return 문에 괄호를 제거합니다.


class login42CallbackView(View):
    def post(self, request):
        print("POST 요청이 수신되었습니다.")
        return JsonResponse({'message': 'This is a successful response.'}, status=200)
