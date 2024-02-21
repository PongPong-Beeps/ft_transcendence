FROM python:3.8

WORKDIR /usr/src/app

COPY ./app/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app .

EXPOSE 8000

#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
#gunicorn --bind unix:/tmp/gunicorn.sock app.wsgi:application
CMD ["gunicorn", "--bind", "unix:/tmp/gunicorn.sock", "app.wsgi:application"]
