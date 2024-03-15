from urllib.parse import parse_qs
from channels.auth import AuthMiddlewareStack
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from user.models import User

@database_sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken(token)
        return User.objects.get(id=access_token['user_id'])
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]
        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)

def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(AuthMiddlewareStack(inner))

