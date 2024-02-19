#!/bin/bash

mv /tmp/default /etc/nginx/sites-available/default

openssl	req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout /etc/ssl/private/server_pkey.pem \
		-out /etc/ssl/certs/server.crt \
		-subj "/C=KR/ST=Seoul/L=Gaepo/O=42Seoul/OU=cadet/CN=PongPongBeeps"

exec "$@"
