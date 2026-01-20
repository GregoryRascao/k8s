# 📚 Kubernetes Project - Guide Complet

## 📋 Vue d'ensemble

Ce projet contient des fichiers de configuration Kubernetes pour déployer et gérer des applications conteneurisées. Inclut des clusters, deployments, services, volumes persistants, et configurations avancées.

---

## 📁 Structure du Projet

```
k8s/
├── readme.md                          # Ce fichier
├── cluster-test/                      # Configuration des clusters Kubernetes
│   ├── clusters/                      # Fichiers de cluster (Kind)
│   │   ├── first-cluster.yaml        # Cluster multi-node
│   │   └── first-clusterv2.yaml      # Cluster alternative
│   ├── accounts/                      # Service Accounts et permissions
│   │   └── admin-dash.yaml           # Service account pour dashboard
│   ├── role-binding/                 # Liaisons de rôles RBAC
│   │   └── admin-dash-binding.yaml   # ClusterRoleBinding admin
│   ├── metrics/                       # Métriques et monitoring
│   │   └── components.yaml           # Composants de métriques
│   └── pods/                          # Pods de test
│       └── mssql.yaml                # Pod MSSQL
│
├── deployment-exo/                    # Déploiements PostgreSQL
│   ├── deployment.yaml               # Configuration complète avec Secret, ConfigMap, PV
│   └── deployment-correction.yaml    # Version corrigée
│
├── exo-complet/                       # Projet complet Express + Nginx
│   ├── express-k8s/                  # Application Express
│   │   ├── dockerfile                # Image Docker Express
│   │   ├── index.js                  # Application Node.js
│   │   ├── package.json              # Dépendances npm
│   │   ├── deployment.yaml           # Déploiement Express (3 replicas)
│   │   ├── db.yaml                   # Configuration PostgreSQL
│   │   ├── correction-deployment.yaml # Version corrigée
│   │   ├── .env                      # Variables d'environnement
│   │   ├── .dockerignore             # Fichiers ignorés Docker
│   │   └── .gitignore                # Fichiers ignorés Git
│   └── nginx/                        # Reverse proxy Nginx
│       ├── nginx-complete.yaml       # Service Nginx + ConfigMap
│       └── nginx.conf                # Configuration Nginx
│
├── volume-exo/                        # Exercice sur les volumes persistants
│   ├── persistant-volume.yaml        # PersistentVolume PostgreSQL
│   ├── volume-claim.yaml             # PersistentVolumeClaim
│   ├── pod-postgres.yaml             # Pod PostgreSQL avec volume
│   └── mssql-complete.yaml           # MSSQL avec volume complet
│
└── registry-test/                     # Tests avec registre Docker privé
    ├── docker-compose.yaml           # Configuration Docker Compose
    └── pods/                         # Pods pour registre
        ├── k8s-pod.yaml              # Pod de test
        └── nginx-reg.yaml            # Nginx pour registre
```

---

## 🔧 Prérequis

```bash
# Kubernetes cluster (v1.20+)
# kubectl CLI installé
# Docker (pour construire les images)
# Kind (optionnel, pour créer des clusters locaux)

# Installation de Kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Vérification de l'installation
kubectl version --client
kind version
```

---

## 🚀 Guide Pratique Étape par Étape

### 1️⃣ Création et Configuration du Cluster

#### A. Créer un cluster multi-node avec Kind

```bash
# Naviguer vers le répertoire clusters
cd cluster-test/clusters/

# Créer le cluster à partir de first-cluster.yaml
kind create cluster --config first-cluster.yaml --name my-cluster

# Vérifier la création du cluster
kubectl cluster-info
kubectl get nodes

# Voir les contextes disponibles
kubectl config get-contexts

# Changer de contexte si nécessaire
kubectl config use-context kind-my-cluster
```

**À savoir**: Le fichier `first-cluster.yaml` crée un cluster avec :
- 1 nœud control-plane
- 2 nœuds worker

#### B. Vérifier la connexion au cluster

```bash
# Afficher les informations du cluster
kubectl cluster-info

# Lister tous les nœuds
kubectl get nodes -o wide

# Voir les détails d'un nœud
kubectl describe node <node-name>

# Vérifier les composants système
kubectl get pods -n kube-system
```

---

### 2️⃣ Configuration des Accès et Permissions (RBAC)

#### A. Créer un Service Account

```bash
# Naviguer au répertoire accounts
cd cluster-test/accounts/

# Appliquer la configuration du service account
kubectl apply -f admin-dash.yaml

# Vérifier la création
kubectl get serviceaccounts -n kubernetes-dashboard
kubectl describe serviceaccount admin-dash -n kubernetes-dashboard
```

#### B. Assigner des Permissions avec ClusterRoleBinding

```bash
# Naviguer au répertoire role-binding
cd cluster-test/role-binding/

# Appliquer la liaison de rôle
kubectl apply -f admin-dash-binding.yaml

# Vérifier la liaison
kubectl get clusterrolebindings | grep admin-dash
kubectl describe clusterrolebinding admin-dash

# Voir les permissions du service account
kubectl auth can-i --list --as=system:serviceaccount:kubernetes-dashboard:admin-dash
```

**Concepts importants**:
- **Service Account**: Identité pour les applications dans le cluster
- **ClusterRole**: Ensemble de permissions (Cluster-wide)
- **ClusterRoleBinding**: Lie un rôle à un service account
- **RBAC**: Role-Based Access Control pour la sécurité

---

### 3️⃣ Gestion des Pods

#### A. Créer et gérer les pods

```bash
# Naviguer au répertoire pods
cd cluster-test/pods/

# Appliquer la configuration du pod MSSQL
kubectl apply -f mssql.yaml

# Lister tous les pods
kubectl get pods

# Voir les pods avec plus de détails
kubectl get pods -o wide

# Voir les pods dans un namespace spécifique
kubectl get pods -n default

# Voir tous les pods dans tous les namespaces
kubectl get pods -A
```

#### B. Inspecter et déboguer les pods

```bash
# Décrire un pod (voir son statut, événements, etc.)
kubectl describe pod <pod-name>

# Voir les logs d'un pod
kubectl logs <pod-name>

# Voir les logs en temps réel (suivi)
kubectl logs -f <pod-name>

# Voir les logs d'un conteneur spécifique dans un pod multi-conteneur
kubectl logs <pod-name> -c <container-name>

# Accéder au shell d'un pod (exécution interactive)
kubectl exec -it <pod-name> -- /bin/bash
kubectl exec -it <pod-name> -- /bin/sh

# Exécuter une commande dans le pod
kubectl exec <pod-name> -- ls -la

# Copier des fichiers depuis/vers le pod
kubectl cp <pod-name>:/path/in/pod ./local/path
kubectl cp ./local/file <pod-name>:/path/in/pod
```

#### C. Supprimer des pods

```bash
# Supprimer un pod
kubectl delete pod <pod-name>

# Supprimer plusieurs pods
kubectl delete pod <pod1> <pod2>

# Supprimer tous les pods d'un namespace
kubectl delete pods --all -n <namespace>

# Force supprimer un pod (grace period = 0)
kubectl delete pod <pod-name> --grace-period=0 --force
```

---

### 4️⃣ Déploiements et Réplication

#### A. Déployer avec PostgreSQL (deployment-exo/)

```bash
# Naviguer au répertoire deployment-exo
cd deployment-exo/

# 📌 IMPORTANT: Ce fichier contient:
# - Secret: données sensibles (mot de passe)
# - ConfigMap: configuration (init.sql)
# - PersistentVolume: stockage
# - PersistentVolumeClaim: requête de stockage
# - Deployment: application PostgreSQL

# Appliquer toute la configuration
kubectl apply -f deployment.yaml

# Vérifier les ressources créées
kubectl get secrets
kubectl get configmaps
kubectl get pv
kubectl get pvc
kubectl get deployments
kubectl get pods
```

**Description détaillée des composants**:

```bash
# 1. Vérifier le Secret
kubectl describe secret pgsql-secret
kubectl get secret pgsql-secret -o jsonpath='{.data.pgsql-password}' | base64 -d

# 2. Vérifier la ConfigMap
kubectl describe configmap pgsql-init-sql
kubectl get configmap pgsql-init-sql -o yaml

# 3. Vérifier les volumes
kubectl describe pv pgsql-pv
kubectl describe pvc pgsql-pvc

# 4. Vérifier le deployment
kubectl describe deployment pgsql-deployment
kubectl get pods -l app=pgsql

# 5. Voir le statut du rollout
kubectl rollout status deployment/pgsql-deployment
```

#### B. Mise à jour et rollback d'un deployment

```bash
# Voir l'historique des déploiements
kubectl rollout history deployment/pgsql-deployment

# Voir les détails d'une révision
kubectl rollout history deployment/pgsql-deployment --revision=1

# Mettre à jour un déploiement (image, replica, etc.)
kubectl set image deployment/pgsql-deployment pgsql=postgres:15 --record

# Voir le statut du rollout
kubectl rollout status deployment/pgsql-deployment

# Annuler le dernier déploiement (rollback)
kubectl rollout undo deployment/pgsql-deployment

# Rollback à une révision spécifique
kubectl rollout undo deployment/pgsql-deployment --to-revision=1
```

---

### 5️⃣ Services et Networking

#### A. Créer et exposer des services

```bash
# Services = façon d'exposer les pods à l'intérieur/extérieur du cluster

# Types de services:
# - ClusterIP (par défaut): accès interne uniquement
# - NodePort: accès via IP du nœud + port (30000-32767)
# - LoadBalancer: accès via load balancer externe
# - ExternalName: expose un service externe

# Naviguer à exo-complet/nginx
cd exo-complet/nginx/

# Appliquer la configuration Nginx (inclut le Service)
kubectl apply -f nginx-complete.yaml

# Lister tous les services
kubectl get svc

# Voir les détails d'un service
kubectl describe svc nginx-service

# Voir les endpoints du service (pods attachés)
kubectl get endpoints
kubectl describe endpoints nginx-service
```

#### B. Accéder aux services

```bash
# Pour un service ClusterIP (accès interne)
kubectl port-forward svc/nginx-service 8080:80

# Pour accéder dans le cluster
# kubectl exec -it <pod> -- curl http://nginx-service

# Pour un service NodePort (accès externe)
# URL: http://<node-ip>:30080

# Trouver l'adresse IP du nœud
kubectl get nodes -o wide

# Voir les ports assignés
kubectl get svc -o wide

# Faire un port-forward vers votre machine locale
kubectl port-forward service/nginx-service 8080:80 --address 0.0.0.0
```

---

### 6️⃣ Projet Complet: Express + PostgreSQL + Nginx

#### Architecture

```
Internet
    ↓
Nginx Service (Port 30080)
    ↓
Nginx Pod (reverse proxy)
    ↓
Express Service
    ↓
Express Pods (3 replicas) ← DB_HOST: postgres-service
    ↓
PostgreSQL Pod
```

#### A. Déployer Express et PostgreSQL

```bash
# Naviguer à exo-complet
cd exo-complet/

# 1. Déployer PostgreSQL
kubectl apply -f express-k8s/db.yaml

# Vérifier le déploiement
kubectl get deployments
kubectl get pods -l app=postgres

# 2. Déployer Express (3 replicas)
kubectl apply -f express-k8s/deployment.yaml

# Vérifier le déploiement
kubectl get deployments
kubectl get pods -l app=express
kubectl get svc express-service

# 3. Déployer Nginx (reverse proxy)
kubectl apply -f nginx/nginx-complete.yaml

# Vérifier tous les services
kubectl get svc
```

#### B. Tester le déploiement complet

```bash
# 1. Port-forward pour accéder à Nginx
kubectl port-forward svc/nginx-service 8080:80

# 2. Dans un autre terminal, accéder à l'application
curl http://localhost:8080

# 3. Voir les logs d'Express
kubectl logs -f <express-pod-name>

# 4. Vérifier la connexion à la base de données
kubectl exec -it <express-pod> -- node -e "
  const client = require('pg').Client;
  const c = new client({host: 'postgres-service', user: 'postgres', password: 'Test123=', database: 'postgres'});
  c.connect();
  c.query('SELECT 1', (err, res) => console.log(err ? 'ERROR' : 'CONNECTED'));
"

# 5. Scaler le déploiement Express
kubectl scale deployment express --replicas=5

# 6. Voir les replicas
kubectl get pods -l app=express
```

#### C. Configurer Nginx comme reverse proxy

```bash
# Le ConfigMap nginx-config dans nginx-complete.yaml contient:
# - Écoute le port 80
# - Proxie les requêtes /api/ vers express-service:8080

# Vérifier la configuration
kubectl get configmap nginx-config -o yaml

# Modifier la configuration (édition directe)
kubectl edit configmap nginx-config

# Redémarrer les pods Nginx pour appliquer les changements
kubectl rollout restart deployment nginx
```

---

### 7️⃣ Volumes Persistants

#### A. Création de PersistentVolume et PersistentVolumeClaim

```bash
# Naviguer à volume-exo
cd volume-exo/

# 1. Créer un PersistentVolume
kubectl apply -f persistant-volume.yaml

# Vérifier les PV
kubectl get pv
kubectl describe pv postgres-pv

# 2. Créer une PersistentVolumeClaim
kubectl apply -f volume-claim.yaml

# Vérifier les PVC
kubectl get pvc
kubectl describe pvc postgres-pvc

# Voir l'association entre PV et PVC
kubectl get pv,pvc
```

**Concepts**:
- **PersistentVolume (PV)**: Ressource de stockage dans le cluster (créée par admin)
- **PersistentVolumeClaim (PVC)**: Requête de stockage par une application
- **hostPath**: Utilise le stockage local du nœud
- **accessModes**: ReadWriteOnce, ReadOnlyMany, ReadWriteMany

#### B. Pod avec volume persistant

```bash
# Créer un pod PostgreSQL avec volume
kubectl apply -f pod-postgres.yaml

# Vérifier le pod
kubectl get pods -l app=postgres-pv
kubectl describe pod <postgres-pod-name>

# Accéder au pod et vérifier le volume
kubectl exec -it <postgres-pod-name> -- bash

# À l'intérieur du pod:
df -h                        # Voir les montages
ls -la /var/lib/postgresql/  # Vérifier le répertoire du volume

# Créer des données dans la base
psql -U postgres -d postgres -c "CREATE TABLE test (id SERIAL, data TEXT);"
psql -U postgres -d postgres -c "INSERT INTO test (data) VALUES ('Données persistantes');"

# Supprimer et recréer le pod
kubectl delete pod <postgres-pod-name>
kubectl apply -f pod-postgres.yaml

# Vérifier que les données persistent
kubectl exec -it <new-postgres-pod-name> -- psql -U postgres -d postgres -c "SELECT * FROM test;"
```

#### C. Exercice MSSQL avec volume complet

```bash
# Déployer MSSQL avec toute la configuration
kubectl apply -f mssql-complete.yaml

# Vérifier tous les composants
kubectl get secret,configmap,pv,pvc,deployment,pods -l app=mssql

# Accéder à MSSQL
kubectl exec -it <mssql-pod-name> -- /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P <PASSWORD>

# À l'intérieur de sqlcmd:
CREATE DATABASE TestDB;
USE TestDB;
CREATE TABLE Users (Id INT PRIMARY KEY, Name VARCHAR(100));
INSERT INTO Users VALUES (1, 'John');
SELECT * FROM Users;
GO
```

---

### 8️⃣ Registre Docker Privé

#### A. Configuration avec Docker Compose

```bash
# Naviguer à registry-test
cd registry-test/

# Démarrer le registre (version Docker Compose)
docker-compose up -d

# Vérifier que le registre fonctionne
curl http://localhost:5000/v2/

# Tags et pushs
docker tag my-app localhost:5000/my-app:v1.0
docker push localhost:5000/my-app:v1.0

# Lister les images dans le registre
curl http://localhost:5000/v2/_catalog
```

#### B. Utiliser le registre dans Kubernetes

```bash
# Naviguer à registry-test/pods
cd registry-test/pods/

# Créer un secret pour l'authentification au registre
kubectl create secret docker-registry registrykey \
  --docker-server=<registry-server> \
  --docker-username=<username> \
  --docker-password=<password>

# Dans les pods, référencer le secret:
# imagePullSecrets:
#   - name: registrykey

# Appliquer les pods
kubectl apply -f k8s-pod.yaml
kubectl apply -f nginx-reg.yaml

# Vérifier
kubectl get pods
kubectl describe pod <pod-name>
```

---

### 9️⃣ Métriques et Monitoring

#### A. Installer Metrics Server

```bash
# Naviguer à cluster-test/metrics
cd cluster-test/metrics/

# Appliquer les composants de métriques
kubectl apply -f components.yaml

# Vérifier l'installation
kubectl get deployment metrics-server -n kube-system

# Attendre quelques secondes, puis vérifier les métriques
kubectl top nodes
kubectl top pods
```

#### B. Voir l'utilisation des ressources

```bash
# Utilisation CPU et mémoire des nœuds
kubectl top nodes

# Utilisation CPU et mémoire des pods
kubectl top pods

# Voir les métriques de tous les namespaces
kubectl top pods -A

# Détails sur un pod spécifique
kubectl describe pod <pod-name> | grep -A 5 "Requests\|Limits"

# Voir les limites de ressources
kubectl get pods -o json | jq '.items[] | {name: .metadata.name, resources: .spec.containers[].resources}'
```

---

## 📊 Commandes Essentielles Récapitulatives

### Affichage et Inspection

```bash
# Clusters
kubectl cluster-info
kubectl get nodes
kubectl get nodes -o wide
kubectl describe node <node-name>

# Ressources générales
kubectl get all                              # Tout
kubectl get all -A                          # Tous les namespaces
kubectl get all -n <namespace>              # Un namespace spécifique

# Ressources spécifiques
kubectl get pods
kubectl get deployments                     # ou 'kubectl get deploy'
kubectl get services                        # ou 'kubectl get svc'
kubectl get configmaps                      # ou 'kubectl get cm'
kubectl get secrets
kubectl get pv
kubectl get pvc
kubectl get ingress

# Description détaillée
kubectl describe pod <pod-name>
kubectl describe svc <service-name>
kubectl describe deployment <deploy-name>

# Logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>                  # En direct
kubectl logs <pod-name> --previous          # Logs du pod précédent
```

### Création et Modification

```bash
# Appliquer une configuration
kubectl apply -f <file>.yaml
kubectl apply -f <directory>/                # Récursivement

# Éditer en direct
kubectl edit pod <pod-name>
kubectl edit deployment <deploy-name>

# Set (modification rapide)
kubectl set image deployment/<name> <container>=<image>
kubectl set env deployment/<name> KEY=VALUE

# Create (une seule fois)
kubectl create deployment <name> --image=<image>
kubectl create service clusterip <name> --tcp=5432:5432
kubectl create secret generic <name> --from-literal=key=value
```

### Suppression

```bash
# Supprimer une ressource
kubectl delete pod <pod-name>
kubectl delete deployment <deploy-name>
kubectl delete svc <service-name>
kubectl delete -f <file>.yaml

# Supprimer tout
kubectl delete all --all
kubectl delete all --all -n <namespace>
```

### Exécution et Accès

```bash
# Exécuter un shell
kubectl exec -it <pod-name> -- /bin/bash
kubectl exec -it <pod-name> -- /bin/sh

# Copier des fichiers
kubectl cp <pod>:/path ./local
kubectl cp ./local <pod>:/path

# Port forward
kubectl port-forward pod/<pod-name> 8080:80
kubectl port-forward svc/<service-name> 8080:80
kubectl port-forward svc/<service-name> 8080:80 --address 0.0.0.0

# Proxy (accès API)
kubectl proxy
```

### Déploiements et Rollout

```bash
# Historique
kubectl rollout history deployment/<name>

# Voir le statut
kubectl rollout status deployment/<name>

# Restart
kubectl rollout restart deployment/<name>

# Undo (rollback)
kubectl rollout undo deployment/<name>
kubectl rollout undo deployment/<name> --to-revision=<number>

# Scale (réplication)
kubectl scale deployment/<name> --replicas=5
```

### Ressources et Limites

```bash
# Voir les requêtes et limites
kubectl top nodes
kubectl top pods

# Décrire les ressources d'un pod
kubectl describe pod <pod-name> | grep -E "Requests|Limits" -A 2

# Voir les ressources disponibles
kubectl describe nodes
```

---

## 🎯 Flux de Travail Recommandé

### Pour un nouveau projet

```bash
# 1. Créer le cluster
kind create cluster --config clusters/first-cluster.yaml

# 2. Configurer les accès
kubectl apply -f cluster-test/accounts/
kubectl apply -f cluster-test/role-binding/

# 3. Installer les métriques
kubectl apply -f cluster-test/metrics/

# 4. Déployer les volumes (si nécessaire)
kubectl apply -f volume-exo/persistant-volume.yaml
kubectl apply -f volume-exo/volume-claim.yaml

# 5. Déployer l'application
kubectl apply -f exo-complet/express-k8s/
kubectl apply -f exo-complet/nginx/

# 6. Vérifier
kubectl get all
kubectl top pods
```

### Pour du débogage

```bash
# 1. Voir le statut général
kubectl get all

# 2. Inspecter les pods problématiques
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# 3. Vérifier les services
kubectl get svc
kubectl describe svc <service-name>

# 4. Tester la connectivité
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Dans le pod debug:
wget http://service-name:port
```

### Supprimer complètement

```bash
# 1. Supprimer tous les déploiements
kubectl delete all --all

# 2. Supprimer les volumes
kubectl delete pvc --all
kubectl delete pv --all

# 3. Supprimer les secrets et configmaps
kubectl delete secret,configmap --all

# 4. Supprimer le cluster
kind delete cluster --name my-cluster
```

---

## 🔍 Astuce: Alias Utiles

Ajouter à `~/.bashrc` ou `~/.zshrc`:

```bash
alias k='kubectl'
alias kg='kubectl get'
alias kd='kubectl describe'
alias kl='kubectl logs'
alias ke='kubectl exec'
alias kaf='kubectl apply -f'
alias kdel='kubectl delete'
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deployments'
alias kgall='kubectl get all -A'
```

---

## 📚 Ressources Supplémentaires

- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [Kind - Kubernetes in Docker](https://kind.sigs.k8s.io/)
- [Kubectl Cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [PostgreSQL dans Kubernetes](https://www.postgresql.org/docs/current/admin.html)

---

## 🆘 Dépannage Courant

| Problème | Solution |
|----------|----------|
| Pod ne démarre pas | `kubectl describe pod <name>` + `kubectl logs <name>` |
| Service inaccessible | `kubectl get endpoints <service>` + vérifier les labels |
| Image introuvable | Vérifier le registre et les secrets d'authentification |
| PVC en "Pending" | Vérifier les PV disponibles: `kubectl get pv` |
| OOMKilled | Pod manque de mémoire - augmenter les limits |
| ImagePullBackOff | Authentification au registre échouée ou image inexistante |

---

**Créé le**: 20 janvier 2026  
**Dernière mise à jour**: Guide complet avec tous les dossiers du projet
