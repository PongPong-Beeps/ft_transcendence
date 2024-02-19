FROM debian:bullseye

EXPOSE 443

COPY ./tools/entrypoint.sh /entrypoint.sh
COPY ./conf/default /tmp/default

RUN apt-get update && \
    apt-get install -y vim nginx openssl && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
