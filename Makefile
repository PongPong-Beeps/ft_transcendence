DOCKER_COMPOSE_FILE = ./srcs/docker-compose.yml
DB_VOLUME = ./srcs/BackEnd/database

all: up

up:
#개인컴퓨터에서 DB_VOLUME 권한 문제 발생시 아래 주석 해제
#sudo chmod -R 777 $(DB_VOLUME)
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build
# 개발할때는 백그라운드 실행하지 않고 로그 다 출력하기
# -d

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
