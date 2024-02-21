FROM python:3.10

WORKDIR /usr/src/app

COPY ./project/requirements.txt ./

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./project .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

#CMD ["gunicorn", "--bind", "unix:/tmp/gunicorn.sock", "app.wsgi:application"]

#CMD ["gunicorn", "--bind", "0:8000", "project.wsgi:application"]
