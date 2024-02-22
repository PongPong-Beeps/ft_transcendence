sleep 10

pip install "psycopg[binary]"

python3 manage.py makemigrations

python3 manage.py migrate

python manage.py runserver 0.0.0.0:8000