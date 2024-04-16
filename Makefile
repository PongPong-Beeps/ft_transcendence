DOCKER_COMPOSE_FILE = ./srcs/docker-compose.yml
DB_VOLUME = ./srcs/BackEnd/database
STORAGE_VOLUME = ./srcs/BackEnd/storage

all: up

up:
	@echo "┌─┐┌─┐┌┐┌┌─┐┌─┐┌─┐┌┐┌┌─┐     ┌┐ ┌─┐┌─┐┌─┐┌─┐"
	@echo "├─┘│ │││││ ┬├─┘│ │││││ ┬ ─── ├┴┐├┤ ├┤ ├─┘└─┐"
	@echo "┴  └─┘┘└┘└─┘┴  └─┘┘└┘└─┘     └─┘└─┘└─┘┴  └─┘"
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build

down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

clean:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v --rmi all --remove-orphans

fclean: clean
	docker system prune --volumes --all --force

delete:
	rm -rf $(DB_VOLUME)
	rm -rf $(STORAGE_VOLUME)

re:
#make fclean
	make down
	make delete
	make all

.PHONY: all up down clean fclean delete re
