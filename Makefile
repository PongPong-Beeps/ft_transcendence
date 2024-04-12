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
	@printf "Are you sure to delete? 'y' to continue, any other input will stop/skip.\n"; \
	read -n1 answer; \
	echo ""; \
	if [ "$$answer" = "y" ]; then \
		printf "\033[33mdelete\033[0m DB_VOLUME [ ]"; \
		rm -rf $(DB_VOLUME); \
		printf "\r\033[33mdelete\033[0m DB_VOLUME [\033[32m✔\033[0m]\n"; \
		printf "\033[33mdelete\033[0m STORAGE_VOLUME [ ]"; \
		rm -rf $(STORAGE_VOLUME); \
		printf "\r\033[33mdelete\033[0m STORAGE_VOLUME [\033[32m✔\033[0m]\n"; \
	else \
		printf "\033[33mdelete Aborted/Skipped\033[0m\n"; \
	fi

re:
#make fclean
	make down
	make delete
	make all

.PHONY: all up down clean fclean delete re
