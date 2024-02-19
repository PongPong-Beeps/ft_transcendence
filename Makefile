DOCKER_COMPOSE_FILE = ./srcs/docker-compose.yml

all: up

up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build -d

down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

clean:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v --rmi all --remove-orphans

fclean: clean
	docker system prune --volumes --all --force

re:
	make fclean
	make all

.PHONY:
	all up down clean fclean re
