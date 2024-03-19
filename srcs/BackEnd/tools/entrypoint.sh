#!/bin/bash

sleep 10

python3 manage.py makemigrations

python3 manage.py migrate

echo "from django.contrib.auth.models import User; User.objects.filter(username='$SUPERUSER_USERNAME').exists() or User.objects.create_superuser('$SUPERUSER_USERNAME', '$SUPERUSER_EMAIL', '$SUPERUSER_PASSWORD')" | python manage.py shell

python manage.py runserver 0.0.0.0:8000

daphne -b 0.0.0.0 -p 8000 project.asgi:application

# gunicorn으로 실행 시
# gunicorn --bind 0:8000 project.wsgi:application
