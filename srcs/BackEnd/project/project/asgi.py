import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from connect.middleware import TokenAuthMiddlewareStack
import connect.routing
import game.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': TokenAuthMiddlewareStack(
        URLRouter(
            connect.routing.websocket_urlpatterns + game.routing.websocket_urlpatterns
        )
    ),
})