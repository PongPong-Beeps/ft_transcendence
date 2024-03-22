"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework import permissions # 권한 설정을 위함
from drf_yasg.views import get_schema_view # 스키마 뷰를 보기 위함
from drf_yasg import openapi #API 제목, 버전, 연락처 정보 등과 같은 메타데이터를 정의합니다.

schema_view = get_schema_view( # API 문서를 위한 스키마 뷰를 생성합니다.
    openapi.Info( # API에 대한 메타데이터를 정의합니다
        title="Pong Pong Beep's API",
        default_version='v1',
        description="This is pong pong beep's API. It is a simple API for a simple app.",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="pong_admin@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True, #스키마 뷰가 공개적으로 접근 가능하도록 지정
    permission_classes=(permissions.AllowAny,), # API 문서를 볼 때 인증이 필요 없음, 현재는 누구나 접근가능
)

from django.contrib import admin
from django.urls import path, include
from connect.views import InviteView, InviteRefuseView

urlpatterns = [
    #Swagger UI를 API 문서를 위해 렌더링하도록 지정합니다
    #cache_timeout=0은 Swagger UI가 캐시되지 않도록 합니다.
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'), #swagger
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('connect/invite/', InviteView.as_view(), name='invite'),
    path('connect/invite/refuse/', InviteRefuseView.as_view(), name='invite_refuse'),
]
