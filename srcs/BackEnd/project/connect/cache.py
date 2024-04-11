from django.core.cache import cache

#CREATE
def set_user_info(user, game_id):
    black_list_ids = [black_user.id for black_user in user.blacklist.all()]

    user_info = {
        "game_id": game_id,
        "user_id": user.id,
        "nickname": user.nickname,
        "black_list": black_list_ids,
    }
    cache.set("u" + str(user.id), user_info)
    print("user_key: ", "u" + str(user.id))
    print("user_info: ", user_info)
    
#READ
def get_user_info(user_id):
    cache_key = "u" + str(user_id)
    user_info = cache.get(cache_key)
    return user_info

#UPDATE
def update_user_info(user):
    cache_key = "u" + str(user.id)
    user_info = cache.get(cache_key)
    
    if user_info:
        black_list_ids = [black_user.id for black_user in user.blacklist.all()]
        
        user_info['nickname'] = user.nickname
        user_info['black_list'] = black_list_ids
        
        cache.set(cache_key, user_info)
        print("Updated user_info in cache:", user_info)

#DELETE    
def delete_user_info(user):
    cache.delete("u" + str(user.id))
    print("delete cache: ", "u" + str(user.id))