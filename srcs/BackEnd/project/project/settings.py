"""
Django settings for project project.

Generated by 'django-admin startproject' using Django 5.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
import datetime
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-k_qnco^zlm0)2kkewpq1@v+qpv^f&c#0e#&0!_gocz6j(d&$j('

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['13.209.222.162', '127.0.0.1', 'localhost']


# Application definition

INSTALLED_APPS = [
    'corsheaders',	#cors
    'user',
    'channels',
	'daphne',
	'connect',
    'game',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg', #swagger
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTStatelessUserAuthentication',
    )
}

#swagger 상단 Authorize 버튼 정보 설정
#swagger 내에서 JWT토큰 사용하기위함
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'value': ''
            #value값에 Bearer를 넣어주면 swagger에서 Authorize 버튼을 눌렀을 때 자동으로 Bearer를 넣어준다.
        }
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(days=10),#테스트를 위해 days로 수정, 추후에 second로 바꿔야함    #access token 유효기간
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=14),      #refresh token 유효기간
    'SIGNING_KEY': SECRET_KEY,                                    #토큰 서명에 사용할 키
    'ALGORITHM': 'HS256',                                       #JWT를 설정하는데 사용되는 알고리즘
    'AUTH_HEADER_TYPES': ('Bearer',),                              #인증 헤더의 유형
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',		#cors
    'django.middleware.common.CommonMiddleware',	#cors
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ORIGIN_ALLOW_ALL = True	#cors

CSRF_TRUSTED_ORIGINS = ['https://127.0.0.1'] #csrf

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'
ASGI_APPLICATION= 'project.asgi.application' #Websocket

CHANNEL_LAYERS = {                           # channel layer 설정
    'default':{
        'BACKEND':'channels.layers.InMemoryChannelLayer',
        "MIDDLEWARE": [
            "channels.auth.TokenAuthMiddlewareStack",
        ],
    }
}

# Django 인메모리 캐시 설정
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

#postgresql
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['POSTGRES_DB'],  # POSTGRES_DB 환경변수의 값을 직접 참조
        'USER': os.environ['POSTGRES_USER'],  # POSTGRES_USER 환경변수의 값을 직접 참조
        'PASSWORD': os.environ['POSTGRES_PASSWORD'], 
        'HOST': 'db',  # db라는 컨테이너 이름을 사용하여 호스트를 지정합니다.
        'PORT': '5432',
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
