---
layout: page
title: Politique de sécurité
permalink: /fr/security/
lang: fr
---

# Politique de sécurité de 3mpwrApp

L'équipe 3mpwrApp s'engage à fournir une sécurité de niveau entreprise pour tous les utilisateurs. Notre architecture de sécurité multicouche protège vos données, votre vie privée et assure un service sûr et fiable.

* * *

## Mesures de sécurité complètes

### Architecture de défense en profondeur à 8 couches

3mpwrApp implémente une stratégie de sécurité complète avec **8 couches distinctes de protection** :

1. **Protection CloudFlare** - Atténuation DDoS, détection de bots, sécurité périphérique
2. **Limitation de débit** - Empêche les abus et les attaques automatisées
3. **Firebase App Check** - Vérifie que les requêtes proviennent d'instances d'application authentiques
4. **Firebase Authentication** - Authentification et autorisation des utilisateurs standard de l'industrie
5. **Règles de sécurité Firebase** - Contrôle d'accès aux données côté serveur
6. **Validation des entrées** - Toutes les entrées utilisateur nettoyées et validées
7. **Surveillance de sécurité** - Détection de menaces et alertes en temps réel
8. **Sécurité de la chaîne d'approvisionnement** - Protection contre les dépendances compromises

* * *

## Authentification et contrôle d'accès

### Firebase Authentication
- **Authentification multifacteur** disponible pour tous les utilisateurs
- Intégration **OAuth 2.0** (Google, Apple, Facebook)
- **Courriel/mot de passe** avec exigences de mot de passe sécurisé
- **Mode invité** pour les utilisateurs soucieux de la vie privée
- **Contrôle d'accès basé sur les rôles** (RBAC) pour les fonctionnalités d'administration
- **Gestion de session** avec expiration automatique
- **Souveraineté du super administrateur** : empowrapp08162025@gmail.com (contrôle du fondateur)

### Règles de sécurité
- **Authentification requise** pour toutes les opérations d'écriture
- **Isolation des données utilisateur** - Les utilisateurs ne peuvent accéder qu'à leurs propres données (basé sur l'UID)
- **Opérations d'administration** nécessitent des revendications Firebase personnalisées
- **Limites de lecture/écriture** appliquées au niveau de la base de données
- **Règles de validation** rejettent les données mal formées
- **Règles publiques** engagées dans le référentiel (meilleure pratique Firebase)

* * *

## Sécurité de la chaîne d'approvisionnement (Mars 2026)

### Protection Socket.dev

**Surveillance en temps réel pour :**
- ✅ **Paquets compromis** (ex. attaque axios 1.14.0/1.14.1/0.30.4)
- ✅ **Attaques de typosquattage** (ex. plain-crypto-js imitant crypto-js)
- ✅ Détection de **logiciels malveillants dans les scripts d'installation**
- ✅ Surveillance de l'**accès réseau/système de fichiers/shell** pendant les installations
- ✅ Détection de **code obscurci**
- ✅ Suivi de la **réputation de l'éditeur**
- ✅ Alertes de **paquets obsolètes**

**Fréquence d'analyse :**
- **Quotidienne** : Audit de sécurité automatisé (9h UTC)
- **Chaque push** : Analyse automatique sur tous les commits
- **Chaque PR** : Analyse avant approbation de fusion
- **Crochets pre-commit** : Analyse locale optionnelle (activer avec SOCKET_SCAN=1)

**Réponse automatisée :**
- **Gravité critique/élevée** : Problème GitHub créé automatiquement + alerte par courriel
- **Échec de construction** : Bloque le déploiement si des vulnérabilités critiques sont détectées
- **Rapports SARIF** : Intégration avec l'onglet Sécurité de GitHub
- **Manuel d'urgence** : Procédures documentées pour une réponse rapide

### État de protection actuel
✅ **0 Vulnérabilités** - Toutes les dépendances analysées et sécurisées  
✅ **axios 1.13.6** - Protégé contre la compromission de mars 2026 (1.14.0/1.14.1/0.30.4)  
✅ **crypto-js légitime** - Aucune attaque de typosquattage présente  
✅ **Socket.dev actif** - Surveillance continue activée

* * *

## Sécurité et confidentialité des données

### Chiffrement des données
- **Au repos** : Toutes les données Firebase chiffrées par défaut (AES-256)
- **En transit** : TLS 1.3 pour toutes les communications réseau
- **De bout en bout** : Téléchargements de preuves chiffrés avant transmission
- **Gestion des clés** : Clés de chiffrement gérées par Google (FIPS 140-2)

### Protections de la vie privée
- **Aucun pixel de suivi** - Zéro traceur d'analyses tierces
- **Analyses Firebase uniquement** - Métriques de première partie préservant la vie privée
- **Mode invité** - Utiliser l'application sans créer de compte
- **Minimisation des données** - Ne collecter que ce qui est nécessaire
- **Exportation des données utilisateur** - Téléchargez vos données à tout moment
- **Droit à la suppression** - Supprimer le compte et toutes les données : [3mpwrapp.ca/delete-data](https://3mpwrapp.ca/delete-data)
- **Conformité RGPD/CCPA** - Conformité complète à la protection des données
- **Pas de vente de données** - Vos données sont à vous, pas un produit

* * *

## Signalement des vulnérabilités

### Divulgation responsable

**Trouvé une vulnérabilité de sécurité ?** Nous apprécions votre aide !

**Comment signaler :**
1. **Courriel** : empowrapp08162025@gmail.com
2. **Sujet** : "Divulgation de vulnérabilité de sécurité"
3. **Inclure** :
   - Description de la vulnérabilité
   - Étapes pour reproduire
   - Impact potentiel
   - Suggestions de correctif (si vous en avez)

**Notre engagement :**
- ✅ Accusé de réception sous 24 heures
- ✅ Évaluation initiale sous 72 heures
- ✅ Mises à jour régulières sur la progression
- ✅ Crédit public (si souhaité)
- ✅ Pas d'action légale contre les chercheurs de bonne foi

**Délais de divulgation :**
- **Critique** : Correctif sous 7 jours
- **Élevé** : Correctif sous 30 jours
- **Moyen** : Correctif sous 90 jours
- **Faible** : Correctif dans la prochaine version

* * *

## Audits de sécurité

### Audits réguliers
- **Analyses automatisées quotidiennes** - Socket.dev, npm audit, Snyk
- **Tests de pénétration mensuels** - Tests manuels de sécurité
- **Audits de code trimestriels** - Révision externe du code
- **Audits annuels complets** - Évaluation de sécurité tierce

### Tests actuels
- **Analyse de dépendances** : Socket.dev + npm audit
- **Analyse de code statique** : ESLint, règles de sécurité TypeScript
- **Règles de sécurité Firebase** : Déployées et testées
- **Surveillance en temps réel** : Firebase, CloudFlare

* * *

## Meilleures pratiques de sécurité

### Pour les utilisateurs :
- ✅ Utilisez l'authentification multifacteur
- ✅ Choisissez des mots de passe forts et uniques
- ✅ Activez les sauvegardes chiffrées (BYOC)
- ✅ Gardez l'application à jour
- ✅ Révisez régulièrement les autorisations de compte
- ✅ Méfiez-vous des tentatives de phishing

### Pour les développeurs :
- ✅ Toutes les dépendances analysées avant l'installation
- ✅ Crochets pre-commit appliquent les normes de sécurité
- ✅ Révisions de code obligatoires
- ✅ Tests automatisés pour tous les changements
- ✅ Aucun secret dans le code source
- ✅ Principe du moindre privilège

* * *

## Conformité et certifications

### Standards de conformité
- ✅ **RGPD** (Règlement général sur la protection des données)
- ✅ **CCPA** (California Consumer Privacy Act)
- ✅ **PIPEDA** (Loi canadienne sur la protection des renseignements personnels)
- ✅ **WCAG 2.2 AA** (Accessibilité web)

### Infrastructure
- ✅ **Google Cloud** (Firebase) - SOC 2, ISO 27001, FIPS 140-2
- ✅ **CloudFlare** - DDoS protection, WAF, edge security
- ✅ **Centres de données canadiens** - Souveraineté des données

* * *

## Incident de sécurité

### Plan de réponse
En cas d'incident de sécurité, nous suivons ces étapes :

1. **Détection** (0-1h) - Identifier et confirmer l'incident
2. **Confinement** (1-4h) - Arrêter la propagation
3. **Éradication** (4-24h) - Éliminer la menace
4. **Récupération** (24-72h) - Restaurer les services
5. **Post-mortem** (72h+) - Analyser et améliorer

### Communication
- **Utilisateurs affectés** : Notification immédiate par courriel
- **Tous les utilisateurs** : Notification dans l'application + publication sur le site web
- **Transparence** : Rapport public après résolution

* * *

## Historique de sécurité

### Incidents de sécurité
**À ce jour : 0 incidents de sécurité**

Nous maintenons un historique public de tous les incidents de sécurité et leur résolution.

### Mises à jour de sécurité
- **Mars 2026** : Protection Socket.dev activée contre les attaques de la chaîne d'approvisionnement
- **Février 2026** : Audit complet WCAG AAA (82% de conformité)
- **Janvier 2026** : Chiffrement BYOC Google Drive amélioré
- **Décembre 2025** : Expansion USA Lite avec validation de sécurité

* * *

## Contact sécurité

**Questions de sécurité :**  
Courriel : empowrapp08162025@gmail.com

**Signaler une vulnérabilité :**  
Courriel : empowrapp08162025@gmail.com  
Sujet : "Divulgation de vulnérabilité de sécurité"

**Mises à jour :**  
[Page des mises à jour de sécurité](/fr/security-updates/)

---

**Dernière révision :** 22 mai 2026  
**Version :** 2.0  
**Langue :** Français (Canada)

**Liens connexes :**
- [Politique de confidentialité](/fr/privacy/)
- [Déclaration d'accessibilité](/fr/accessibility/)
- [Conditions d'utilisation](/fr/terms/)
