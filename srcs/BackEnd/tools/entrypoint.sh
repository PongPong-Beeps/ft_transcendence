#!/bin/bash

sleep 5

python3 manage.py makemigrations

python3 manage.py migrate

echo "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', '1234')" | python manage.py shell

python manage.py runserver 0.0.0.0:8000

# gunicorn으로 실행 시
# gunicorn --bind 0:8000 project.wsgi:application
