from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(Friend)
admin.site.register(GameRecord)
admin.site.register(Blacklist)
admin.site.register(UserList)
admin.site.register(GameRoom)