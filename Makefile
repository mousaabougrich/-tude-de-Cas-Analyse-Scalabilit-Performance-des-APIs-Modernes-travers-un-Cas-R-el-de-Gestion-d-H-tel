# Makefile pour la Gestion du Projet de Comparaison des APIs

.PHONY: help build start stop restart clean logs test-rest test-graphql test-grpc test-soap test-all monitoring

# Variables
COMPOSE=docker-compose
SPRING_DIR=backend-spring
GRAPHQL_DIR=backend-graphql
GRPC_DIR=backend-grpc

# Couleurs pour l'output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Affiche cette aide
	@echo "$(GREEN)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# ===== Installation et Configuration =====

install: ## Installe toutes les dépendances
	@echo "$(GREEN)Installation des dépendances...$(NC)"
	cd $(SPRING_DIR) && mvn clean install -DskipTests
	cd $(GRAPHQL_DIR) && npm install
	cd $(GRPC_DIR) && mvn clean install -DskipTests
	@echo "$(GREEN)✓ Installation terminée$(NC)"

build: ## Build tous les services
	@echo "$(GREEN)Building all services...$(NC)"
	$(COMPOSE) build
	@echo "$(GREEN)✓ Build terminé$(NC)"

# ===== Gestion des Services =====

start: ## Démarre tous les services
	@echo "$(GREEN)Démarrage des services...$(NC)"
	$(COMPOSE) up -d
	@echo "$(GREEN)✓ Services démarrés$(NC)"
	@echo "$(YELLOW)REST API:$(NC)      http://localhost:8080"
	@echo "$(YELLOW)GraphQL API:$(NC)   http://localhost:4000"
	@echo "$(YELLOW)gRPC API:$(NC)      localhost:9090"
	@echo "$(YELLOW)Prometheus:$(NC)    http://localhost:9091"
	@echo "$(YELLOW)Grafana:$(NC)       http://localhost:3001"
	@echo "$(YELLOW)Jaeger:$(NC)        http://localhost:16686"

start-db: ## Démarre uniquement la base de données
	$(COMPOSE) up -d postgres
	@echo "$(GREEN)✓ PostgreSQL démarré$(NC)"

start-monitoring: ## Démarre uniquement les services de monitoring
	$(COMPOSE) up -d prometheus grafana jaeger
	@echo "$(GREEN)✓ Services de monitoring démarrés$(NC)"

stop: ## Arrête tous les services
	@echo "$(YELLOW)Arrêt des services...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)✓ Services arrêtés$(NC)"

restart: stop start ## Redémarre tous les services

clean: ## Nettoie tout (images, volumes, containers)
	@echo "$(RED)⚠ Suppression de tous les containers, volumes et images...$(NC)"
	$(COMPOSE) down -v --rmi all
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

# ===== Logs =====

logs: ## Affiche les logs de tous les services
	$(COMPOSE) logs -f

logs-rest: ## Affiche les logs du backend REST/SOAP
	$(COMPOSE) logs -f backend-spring

logs-graphql: ## Affiche les logs du backend GraphQL
	$(COMPOSE) logs -f backend-graphql

logs-grpc: ## Affiche les logs du backend gRPC
	$(COMPOSE) logs -f backend-grpc

logs-db: ## Affiche les logs de PostgreSQL
	$(COMPOSE) logs -f postgres

# ===== Tests =====

test-rest: ## Exécute les tests de performance REST avec k6
	@echo "$(GREEN)Test REST avec k6...$(NC)"
	cd performance-tests/k6 && k6 run --vus 100 --duration 2m rest-test.js

test-graphql: ## Exécute les tests de performance GraphQL avec k6
	@echo "$(GREEN)Test GraphQL avec k6...$(NC)"
	cd performance-tests/k6 && k6 run --vus 100 --duration 2m graphql-test.js

test-rest-locust: ## Exécute les tests REST avec Locust
	@echo "$(GREEN)Test REST avec Locust...$(NC)"
	cd performance-tests/locust && locust -f rest-locustfile.py --host=http://localhost:8080

test-graphql-locust: ## Exécute les tests GraphQL avec Locust
	@echo "$(GREEN)Test GraphQL avec Locust...$(NC)"
	cd performance-tests/locust && locust -f graphql-locustfile.py --host=http://localhost:4000

test-all: ## Exécute tous les tests de performance
	@echo "$(GREEN)Exécution de tous les tests...$(NC)"
	./run-tests.ps1 -API all -TestType load -Users 100 -Duration "5m"

# ===== Monitoring =====

monitoring: ## Ouvre les dashboards de monitoring
	@echo "$(GREEN)Ouverture des dashboards...$(NC)"
	@powershell -Command "Start-Process http://localhost:3001"
	@powershell -Command "Start-Process http://localhost:16686"
	@powershell -Command "Start-Process http://localhost:9091"

prometheus: ## Ouvre Prometheus
	@powershell -Command "Start-Process http://localhost:9091"

grafana: ## Ouvre Grafana
	@powershell -Command "Start-Process http://localhost:3001"

jaeger: ## Ouvre Jaeger UI
	@powershell -Command "Start-Process http://localhost:16686"

# ===== Base de Données =====

db-shell: ## Se connecte au shell PostgreSQL
	$(COMPOSE) exec postgres psql -U hoteluser -d hotel_reservation

db-reset: ## Réinitialise la base de données
	@echo "$(YELLOW)Réinitialisation de la base de données...$(NC)"
	$(COMPOSE) exec postgres psql -U hoteluser -d hotel_reservation -f /docker-entrypoint-initdb.d/init.sql
	@echo "$(GREEN)✓ Base de données réinitialisée$(NC)"

# ===== Health Checks =====

health: ## Vérifie l'état de santé de tous les services
	@echo "$(GREEN)Vérification des services...$(NC)"
	@echo "$(YELLOW)REST API:$(NC)"
	@curl -s http://localhost:8080/actuator/health || echo "$(RED)✗ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)GraphQL API:$(NC)"
	@curl -s http://localhost:4000/.well-known/apollo/server-health || echo "$(RED)✗ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)Prometheus:$(NC)"
	@curl -s http://localhost:9091/-/healthy || echo "$(RED)✗ Non disponible$(NC)"
	@echo ""

ps: ## Liste les containers en cours d'exécution
	$(COMPOSE) ps

# ===== Documentation =====

docs: ## Ouvre la documentation
	@echo "$(GREEN)Ouverture de la documentation...$(NC)"
	@powershell -Command "Start-Process README.md"
	@powershell -Command "Start-Process QUICKSTART.md"
	@powershell -Command "Start-Process RESULTS_ANALYSIS.md"

swagger: ## Ouvre Swagger UI
	@powershell -Command "Start-Process http://localhost:8080/swagger-ui.html"

graphql-playground: ## Ouvre GraphQL Playground
	@powershell -Command "Start-Process http://localhost:4000"

# ===== Développement =====

dev-rest: ## Lance le backend REST en mode développement
	cd $(SPRING_DIR) && mvn spring-boot:run

dev-graphql: ## Lance le backend GraphQL en mode développement
	cd $(GRAPHQL_DIR) && npm run dev

build-rest: ## Build le backend REST/SOAP
	cd $(SPRING_DIR) && mvn clean package -DskipTests

build-graphql: ## Build le backend GraphQL
	cd $(GRAPHQL_DIR) && npm run build

build-grpc: ## Build le backend gRPC
	cd $(GRPC_DIR) && mvn clean package -DskipTests

# ===== Quick Actions =====

quick-test: start ## Démarre les services et lance un test rapide
	@echo "$(GREEN)Attente du démarrage des services...$(NC)"
	@timeout /t 30
	@echo "$(GREEN)Lancement d'un test rapide...$(NC)"
	cd performance-tests/k6 && k6 run --vus 10 --duration 30s rest-test.js

demo: start ## Démarre tout et ouvre les dashboards
	@echo "$(GREEN)Attente du démarrage des services...$(NC)"
	@timeout /t 30
	@make monitoring
	@make swagger
	@make graphql-playground

# ===== Default =====

all: install build start ## Installation, build et démarrage complet
	@echo "$(GREEN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║      Projet prêt! Utilisez 'make help' pour l'aide       ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════════════════════════╝$(NC)"
