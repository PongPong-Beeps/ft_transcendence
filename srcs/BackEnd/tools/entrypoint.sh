#!/bin/bash

sleep 10

python3 manage.py makemigrations

python3 manage.py migrate

python manage.py runserver 0.0.0.0:8000

# gunicorn으로 실행 시
# gunicorn --bind 0:8000 project.wsgi:application