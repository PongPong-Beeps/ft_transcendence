from django.contrib import admin
from .models import Client, InvitationQueue

admin.site.register(Client)
admin.site.register(InvitationQueue)
