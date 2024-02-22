FROM python:3.10

WORKDIR /usr/src/app

COPY ./project/requirements.txt ./

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./project .

COPY ./tools/cmd.sh .

EXPOSE 8000

CMD ["bash", "cmd.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

#CMD ["gunicorn", "--bind", "0:8000", "project.wsgi:application"]
