from django.core.cache import cache

#CREATE
def set_all_ready_status(game_id):
    cache.set(str(game_id) + 'room', False)

#READ
def get_all_ready_status(game_id):
    all_ready_status = cache.get(str(game_id) + 'room')
    return all_ready_status

#UPDATE    
def update_all_ready_status(game_id):
    all_ready_status = cache.get(str(game_id) + 'room')
    if all_ready_status is not None:
        cache.set(str(game_id) + 'room', True)

#DELETE    
def delete_all_ready_status(game_id):
    cache.delete(str(game_id) + 'room', False)