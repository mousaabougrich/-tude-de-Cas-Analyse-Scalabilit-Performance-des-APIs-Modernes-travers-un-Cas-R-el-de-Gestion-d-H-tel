# Guide des Tests de Performance

## 🎯 Objectifs des Tests

Ce guide décrit comment exécuter une suite complète de tests de performance pour comparer REST, SOAP, GraphQL et gRPC.

## 📋 Préparation

### 1. Vérifier que tous les services sont opérationnels

```bash
# Vérifier l'état des services
docker-compose ps

# Services requis:
# - postgres (healthy)
# - backend-spring (running)
# - backend-graphql (running)
# - backend-grpc (running)
# - prometheus (running)
# - grafana (running)
# - jaeger (running)
```

### 2. Installer les outils de test

```bash
# k6
# Windows (via Chocolatey)
choco install k6

# ou télécharger depuis: https://k6.io/docs/getting-started/installation/

# Locust
pip install locust

# JMeter
# Télécharger depuis: https://jmeter.apache.org/download_jmeter.cgi
# Extraire et ajouter bin/ au PATH

# Gatling
# Déjà inclus dans le projet via Maven
```

## 🧪 Scénarios de Test

### Scénario 1: Test de Charge Baseline (10 utilisateurs)

**Objectif**: Établir les performances de référence

#### REST
```bash
cd performance-tests/k6
k6 run --vus 10 --duration 2m rest-test.js
```

#### GraphQL
```bash
k6 run --vus 10 --duration 2m graphql-test.js
```

#### Métriques attendues:
- Latence moyenne < 100ms
- Taux d'erreur < 1%
- RPS > 50

### Scénario 2: Test de Charge Moyenne (100 utilisateurs)

**Objectif**: Simuler une charge typique

#### REST avec Locust
```bash
cd performance-tests/locust
locust -f rest-locustfile.py --host=http://localhost:8080 \
  --users 100 --spawn-rate 10 --run-time 5m --headless \
  --csv=results/rest-100users
```

#### GraphQL avec Locust
```bash
locust -f graphql-locustfile.py --host=http://localhost:4000 \
  --users 100 --spawn-rate 10 --run-time 5m --headless \
  --csv=results/graphql-100users
```

#### Métriques attendues:
- Latence p95 < 500ms
- Taux d'erreur < 2%
- RPS > 200

### Scénario 3: Test de Charge Élevée (500 utilisateurs)

**Objectif**: Tester la scalabilité

```bash
# REST
k6 run --vus 500 --duration 5m rest-test.js

# GraphQL
k6 run --vus 500 --duration 5m graphql-test.js
```

#### Métriques attendues:
- Latence p95 < 2000ms
- Taux d'erreur < 5%
- RPS > 500

### Scénario 4: Test de Stress (1000 utilisateurs)

**Objectif**: Identifier les limites du système

```bash
# REST
locust -f rest-locustfile.py --host=http://localhost:8080 \
  --users 1000 --spawn-rate 50 --run-time 10m --headless

# GraphQL
locust -f graphql-locustfile.py --host=http://localhost:4000 \
  --users 1000 --spawn-rate 50 --run-time 10m --headless
```

### Scénario 5: Test de Spike

**Objectif**: Tester la résilience face à des pics soudains

```bash
# Configuration k6 avec stages
k6 run --stages '10s:10,30s:1000,10s:10,30s:100' rest-test.js
```

### Scénario 6: Test d'Endurance

**Objectif**: Vérifier la stabilité sur une longue période

```bash
# Test sur 1 heure avec 100 utilisateurs constants
k6 run --vus 100 --duration 1h rest-test.js
```

## 📊 Tailles de Messages

### Configuration des Payloads

Les tests incluent 3 tailles de messages:

#### Petit (1 KB) - Réservation Simple
```json
{
  "clientId": 1,
  "roomId": 1,
  "checkInDate": "2025-12-25",
  "checkOutDate": "2025-12-28",
  "numberOfGuests": 2
}
```

#### Moyen (10 KB) - Avec Détails
```json
{
  "clientId": 1,
  "roomId": 1,
  "checkInDate": "2025-12-25",
  "checkOutDate": "2025-12-28",
  "numberOfGuests": 2,
  "specialRequests": "Long text with special requirements...",
  "preferences": {
    "floor": "high",
    "view": "sea",
    "bedType": "king"
  },
  "additionalServices": [...]
}
```

#### Grand (100 KB) - Avec Historique
Inclut l'historique complet du client, préférences détaillées, et métadonnées.

## 📈 Collecte des Métriques

### Prometheus Queries

```promql
# Latence moyenne
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])

# Percentile 95
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# Taux de requêtes
rate(http_server_requests_seconds_count[1m])

# Taux d'erreur
rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / rate(http_server_requests_seconds_count[5m])
```

### Jaeger Tracing

1. Ouvrir http://localhost:16686
2. Sélectionner le service (hotel-reservation-spring, hotel-reservation-graphql)
3. Filtrer par opération
4. Analyser les traces pour identifier les goulots d'étranglement

### Grafana Dashboards

1. Importer les dashboards recommandés:
   - Spring Boot: 6756
   - JVM: 4701
   - PostgreSQL: 9628

2. Créer un dashboard personnalisé pour comparer les APIs

## 📝 Analyse des Résultats

### 1. Exporter les Résultats

#### k6
```bash
k6 run --out json=results.json rest-test.js
```

#### Locust
```bash
# Résultats disponibles dans results/*.csv
# - results_stats.csv: Statistiques globales
# - results_stats_history.csv: Historique temporel
# - results_failures.csv: Échecs
```

### 2. Générer des Rapports

#### k6 Report
```bash
# Installer k6-reporter
npm install -g k6-to-junit

# Convertir les résultats
k6-to-junit results.json
```

#### JMeter HTML Report
```bash
jmeter -g results.jtl -o report/
```

### 3. Comparer les APIs

Créer un tableau comparatif:

| Métrique | REST | SOAP | GraphQL | gRPC |
|----------|------|------|---------|------|
| Latence moyenne | | | | |
| Latence p95 | | | | |
| RPS max | | | | |
| Taux d'erreur | | | | |
| CPU moyen | | | | |
| Mémoire moyenne | | | | |

## 🔍 Checklist de Test Complet

### Phase 1: Tests Fonctionnels
- [ ] REST: Toutes les opérations CRUD fonctionnent
- [ ] SOAP: Toutes les opérations SOAP fonctionnent
- [ ] GraphQL: Toutes les queries/mutations fonctionnent
- [ ] gRPC: Tous les RPCs fonctionnent

### Phase 2: Tests de Performance
- [ ] Test baseline (10 users) pour chaque API
- [ ] Test charge moyenne (100 users) pour chaque API
- [ ] Test charge élevée (500 users) pour chaque API
- [ ] Test de stress (1000 users) pour chaque API

### Phase 3: Tests de Scalabilité
- [ ] Test de montée en charge progressive
- [ ] Test de spike
- [ ] Test d'endurance (1h+)

### Phase 4: Tests de Résilience
- [ ] Test avec panne de base de données
- [ ] Test avec latence réseau simulée
- [ ] Test de récupération après erreur

### Phase 5: Collecte des Métriques
- [ ] Métriques Prometheus collectées
- [ ] Traces Jaeger analysées
- [ ] Dashboards Grafana créés
- [ ] Logs agrégés dans Elasticsearch

### Phase 6: Analyse et Rapport
- [ ] Tableaux comparatifs créés
- [ ] Graphiques de performance générés
- [ ] Recommandations documentées
- [ ] Rapport final rédigé

## 🚨 Troubleshooting

### Problème: Taux d'erreur élevé

**Solutions**:
1. Vérifier les logs des services
2. Augmenter les ressources (CPU, mémoire)
3. Optimiser les requêtes SQL
4. Augmenter le pool de connexions DB

### Problème: Latence élevée

**Solutions**:
1. Activer le caching
2. Optimiser les index DB
3. Réduire le nombre de requêtes SQL (N+1 problem)
4. Utiliser la pagination

### Problème: Services crashent sous charge

**Solutions**:
1. Augmenter les limites de mémoire JVM
2. Optimiser le garbage collection
3. Identifier les fuites mémoire
4. Utiliser le pooling de connexions

## 📞 Support

Pour toute question ou problème:
1. Consulter les logs: `docker-compose logs [service]`
2. Vérifier le dashboard Grafana
3. Examiner les traces dans Jaeger
4. Consulter la documentation des outils

## 📚 Ressources

- [k6 Documentation](https://k6.io/docs/)
- [Locust Documentation](https://docs.locust.io/)
- [JMeter User Manual](https://jmeter.apache.org/usermanual/index.html)
- [Gatling Documentation](https://gatling.io/docs/)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
