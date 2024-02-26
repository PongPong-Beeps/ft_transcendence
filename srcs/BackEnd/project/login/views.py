from django.shortcuts import redirect
from django.views import View

class login42TestView(View):
    def get(self, request):  # 수정: get 메서드의 첫 번째 매개변수는 self여야 합니다.
        target_url = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-6da803718d6fd73157034c6b420e69e7edc0e341297bc27bbccd7c840bfbbdd4&redirect_uri=https%3A%2F%2F127.0.0.1%2Flobby&response_type=code'
        return redirect(target_url)  # 수정: return 문에 괄호를 제거합니다.
