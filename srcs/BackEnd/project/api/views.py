from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def index(request):
    print("Im index func in api")
    if request.method == 'GET':
        print("GET")
    else:
        print("else")
    data = {'message': '안녕하세요'}
    return JsonResponse(data)
