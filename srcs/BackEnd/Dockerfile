FROM python:3.12

WORKDIR /usr/src/app

COPY ./project/requirements.txt ./

RUN apt-get update && apt-get install -y nano
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./project .

COPY ./tools/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
