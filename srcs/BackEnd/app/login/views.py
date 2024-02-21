from django.shortcuts import render

from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth import login


def index(request):
    print("Im index func in login")
    if request.method == 'GET':
        print("GET")
    else:
        print("else")
    return render(request, 'login/index.html')

def login(request):
    print("Im login func in login")
    if request.method == 'GET':
        print("GET")
    else:
        print("else")
    return render(request, 'login/login.html')
