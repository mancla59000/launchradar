# Complexity Matrix - Decision Framework

## Overview
Matrice de décision pour choisir entre mode Fast-track (SuperClaude contextuel) et Full BMAD (workflow complet).

## Scoring System
Chaque dimension évaluée de 1 à 3 points, score total sur 12.

## Dimensions d'Évaluation

### 1. Complexité Technique (1-3 points)
**1 point - Simple :**
- Stack technologique standard (React + Node.js ou similaire)
- 1-2 technologies principales
- Patterns bien établis et documentés
- Peu d'intégrations externes

**2 points - Moyenne :**
- 3-5 technologies à intégrer
- Quelques APIs externes ou services tiers
- Mix de technologies familières et nouvelles
- Architecture standard avec quelques spécificités

**3 points - Complexe :**
- 6+ technologies différentes
- Microservices ou architecture distribuée
- Technologies de pointe ou expérimentales
- Nombreuses intégrations et dépendances

### 2. Timeline Estimée (1-3 points)
**1 point - Court terme :**
- < 1 semaine de développement
- MVP ou prototype rapide
- Fonctionnalités limitées et bien définies
- Pas de phase de recherche/expérimentation

**2 points - Moyen terme :**
- 1-4 semaines de développement
- Application complète mais scope maîtrisé
- Quelques itérations prévues
- Phase de test et refinement

**3 points - Long terme :**
- > 1 mois de développement
- Projet complexe multi-phases
- Évolutions et maintenance à long terme
- Recherche et expérimentation nécessaires

### 3. Taille de l'Équipe (1-3 points)
**1 point - Solo :**
- 1 développeur principal
- Responsabilités polyvalentes
- Communication simplifiée
- Décisions rapides

**2 points - Petite équipe :**
- 2-5 développeurs
- Spécialisations partielles
- Coordination nécessaire mais manageable
- Processus légers

**3 points - Grande équipe :**
- 6+ développeurs
- Spécialisations marquées
- Coordination complexe requise
- Processus structurés nécessaires

### 4. Complexité du Domaine (1-3 points)
**1 point - Standard :**
- Domaine métier connu (e-commerce, blog, etc.)
- Patterns établis disponibles
- Requirements clairs et stables
- Peu d'expertise spécifique requise

**2 points - Spécialisé :**
- Domaine spécifique nécessitant expertise
- Quelques requirements complexes ou flous
- Besoin de recherche utilisateur
- Réglementations ou contraintes spéciales

**3 points - Expert :**
- Domaine hautement spécialisé ou innovant
- R&D et expérimentation requises
- Requirements évolutifs et complexes
- Expertise domain critique au succès

## Decision Logic

### Score ≤ 6 : Mode Fast-Track
**Approche :** SuperClaude contextuel pur
**Agents activés :** Spécialistes selon contexte détecté
**Documentation :** Minimale mais focalisée
**Workflow :** Itératif et agile

### Score > 6 : Mode Full BMAD
**Approche :** Workflow complet BMAD
**Agents activés :** Orchestrateurs + séquence complète
**Documentation :** Complète et structurée
**Workflow :** Phases séquentielles avec gates

## Exemples d'Évaluation

### Exemple 1 - Blog Personnel avec CMS
- Technique: 1 (Next.js + Headless CMS)
- Timeline: 1 (< 1 semaine)
- Équipe: 1 (Solo)
- Domaine: 1 (Blog standard)
- **Score: 4 → Fast-Track**

### Exemple 2 - E-commerce B2B avec Intégrations
- Technique: 2 (React + Node + Payment + CRM)
- Timeline: 2 (2-3 semaines)
- Équipe: 2 (3 développeurs)
- Domaine: 2 (E-commerce spécialisé B2B)
- **Score: 8 → Full BMAD**

### Exemple 3 - Platform IA pour Healthcare
- Technique: 3 (ML + Real-time + Compliance)
- Timeline: 3 (> 2 mois)
- Équipe: 3 (8+ développeurs)
- Domaine: 3 (Healthcare + AI + Réglementation)
- **Score: 12 → Full BMAD avec expansion packs**

## Overrides Manuels
Possibilité de forcer un mode spécifique via `/project mode [mode]` si :
- Contraintes projet spéciales
- Préférences équipe établies
- Contexte organisationnel particulier