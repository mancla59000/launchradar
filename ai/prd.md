# Product Requirements Document: LaunchRadar

**Date:** 2025-08-01  
**Product Manager:** BMAD Framework Product Manager  
**Project Phase:** Planning  
**Status:** Draft v1.0  
**Reference:** [ai/project-brief.md](./project-brief.md)

---

## Status
**Draft** - Ready for Architecture team handoff

## Context (Enrichi MCP)

**Business Brief Analysis (Serena Analysis):**
- Project brief validated avec 923 mots (>500 minimum requis)
- Vision business claire: "Devenir la référence en intelligence économique automatisée pour l'écosystème micro-SaaS"
- 4 objectifs business mesurables identifiés avec KPIs quantifiables
- 6 stakeholders mappés avec stratégies d'engagement définies
- Contraintes techniques et budget clairement définis

**Industry Patterns (Context7 Research):**  
- Patterns APM framework pour User Stories structure recommandée
- Méthodologie "En tant que [rôle], je veux [action] pour [bénéfice]" validée
- Critères d'acceptation SMART pattern identifiés
- API-first design patterns pour SaaS platforms établis

## User Stories

### Epic 1: Data Collection & Intelligence Engine

#### User Story 1.1: Automated Social Media Monitoring
**En tant que** entrepreneur micro-SaaS, **je veux** que la plateforme surveille automatiquement Twitter et Reddit 24/7 **pour** identifier les opportunités de marché sans effort manuel.

**Critères d'acceptation:**
- [ ] Le système collecte minimum 1000 posts/jour depuis Twitter API v2 et Reddit API
- [ ] Les filtres par mots-clés (#buildinpublic, #indiehackers, MRR, revenue) fonctionnent avec 95% de précision
- [ ] Rate limiting intelligent maintient conformité APIs sans interruption service
- [ ] Données collectées stockées avec timestamp et métadonnées source

**Estimation:** 8 Story Points | **Priorité:** High  
**Référence Brief:** Section "Data Collection System" - Requirements fonctionnels 1

#### User Story 1.2: Intelligent Opportunity Scoring
**En tant que** entrepreneur, **je veux** un système de scoring automatique des opportunités détectées **pour** prioriser mes efforts de développement sur les projets avec le plus fort potentiel.

**Critères d'acceptation:**
- [ ] Algorithme de scoring basé sur engagement, croissance, mentions avec précision >80%
- [ ] Classification automatique par vertical/industrie avec taxonomie définie
- [ ] Score composite 0-100 avec facteurs de pondération transparents
- [ ] Détection patterns de succès/échec basé sur données historiques

**Estimation:** 13 Story Points | **Priorité:** High  
**Référence Brief:** Section "Intelligence Analysis Engine" - Requirements fonctionnels 2

### Epic 2: User Interface & Dashboard

#### User Story 2.1: Real-time Opportunity Dashboard
**En tant que** utilisateur payant, **je veux** un dashboard temps réel avec visualisations des opportunités **pour** analyser rapidement les tendances du marché.

**Critères d'acceptation:**
- [ ] Dashboard responsive charge en <3 secondes (KPI performance Brief)
- [ ] Visualisations interactives avec filtres par date, score, industrie
- [ ] Mise à jour temps réel des nouvelles opportunités détectées
- [ ] Export données CSV/JSON pour analyse externe

**Estimation:** 5 Story Points | **Priorité:** High  
**Référence Brief:** Section "User Interface & Experience" - Requirements fonctionnels 3

#### User Story 2.2: Personalized Alert System
**En tant que** entrepreneur spécialisé, **je veux** des alertes personnalisées selon mes domaines d'expertise **pour** être notifié immédiatement des opportunités pertinentes.

**Critères d'acceptation:**
- [ ] Système alertes configurables par domaine, score minimum, mots-clés
- [ ] Notifications push, email, et in-app disponibles
- [ ] Historique alertes avec statut "vue/ignorée/intéressante"
- [ ] Fréquence personnalisable (temps réel, quotidien, hebdomadaire)

**Estimation:** 8 Story Points | **Priorité:** Medium  
**Référence Brief:** Section "User Interface & Experience" - Système d'alertes personnalisables

### Epic 3: Business Intelligence & Reporting

#### User Story 3.1: Automated Market Intelligence Reports
**En tant que** investisseur/consultant, **je veux** des rapports automatisés sur les tendances du marché **pour** prendre des décisions d'investissement informées.

**Critères d'acceptation:**
- [ ] Digest quotidien automatisé généré et envoyé par email
- [ ] Rapport hebdomadaire de tendances avec analyses prédictives
- [ ] Intégration Metabase pour KPI dashboard business
- [ ] Métriques de performance (taux de clics, conversion, retention) trackées

**Estimation:** 5 Story Points | **Priorité:** Medium  
**Référence Brief:** Section "Business Intelligence Reporting" - Requirements fonctionnels 4

### Epic 4: Technical Infrastructure & Scalability

#### User Story 4.1: Scalable Data Processing Pipeline
**En tant que** système technique, **je dois** traiter jusqu'à 100K posts/jour **pour** supporter la croissance utilisateur sans dégradation performance.

**Critères d'acceptation:**
- [ ] Pipeline de traitement supporte 100K posts/jour (requirement scalabilité Brief)
- [ ] Auto-scaling infrastructure activé selon charge
- [ ] Temps de traitement <24h pour nouvelles données maintenu
- [ ] Monitoring infrastructure avec alertes sur pannes/ralentissements

**Estimation:** 13 Story Points | **Priorité:** High  
**Référence Brief:** Section "Non-Functional Requirements" - Scalability

#### User Story 4.2: Security & Compliance Implementation
**En tant que** plateforme SaaS, **je dois** implémenter RGPD compliance et sécurité des données **pour** respecter les régulations européennes et protéger les utilisateurs.

**Critères d'acceptation:**
- [ ] RGPD compliance pour données EU implémentée
- [ ] API rate limiting et authentification sécurisée
- [ ] Data encryption at rest et in transit activé
- [ ] Audit trail pour accès et modifications données

**Estimation:** 8 Story Points | **Priorité:** High  
**Référence Brief:** Section "Security & Compliance" - Requirements non-fonctionnels 3

### Epic 5: Monetization & User Management

#### User Story 5.1: Subscription Management System
**En tant que** entrepreneur, **je veux** m'abonner facilement à la plateforme **pour** accéder aux fonctionnalités premium d'intelligence économique.

**Critères d'acceptation:**
- [ ] Intégration Stripe pour paiements récurrents
- [ ] Plans tarifaires configurables (freemium/premium)
- [ ] Onboarding utilisateur avec trial période définie
- [ ] Dashboard utilisateur pour gestion abonnement

**Estimation:** 8 Story Points | **Priorité:** Medium  
**Référence Brief:** Section "Business Requirements" - Monétisation implicite

## Roadmap

### Phase 1: MVP Core (Semaines 1-4)
- **User Story 1.1** - Data Collection System - *Backend Agent*
- **User Story 1.2** - Scoring Engine - *Backend Agent + ML Specialist*
- **User Story 2.1** - Dashboard Core - *Frontend Agent*
- **User Story 4.1** - Infrastructure Setup - *DevOps Agent*

### Phase 2: Product-Market Fit (Semaines 5-8)
- **User Story 2.2** - Alert System - *Frontend Agent + Backend Agent*
- **User Story 4.2** - Security Implementation - *Security Agent*
- **User Story 5.1** - Monetization - *Backend Agent + Frontend Agent*
- **User Story 3.1** - Reporting (Basic) - *Backend Agent*

### Phase 3: Scale & Optimization (Semaines 9-12)
- **User Story 3.1** - Advanced Reporting - *Analytics Agent + Backend Agent*
- Performance optimization basée sur feedback utilisateurs
- API publique pour développeurs (extension future)
- International expansion preparation

## Acceptance Criteria Global

### Performance Targets (Référence Brief KPIs)
- **Précision scoring:** >80% (KPI Brief validé)
- **Uptime système:** >99.5% (KPI Brief validé)
- **Page load time:** <3 secondes (Requirements non-fonctionnels Brief)
- **API response time:** <500ms (Requirements non-fonctionnels Brief)

### Business Metrics
- **Revenue Goal:** 4 000€ MRR dans 12 mois (Objectif Brief)
- **User Acquisition:** 200 utilisateurs payants actifs (Objectif Brief)
- **Cost Control:** Coûts infrastructure <200€/mois (Contrainte Brief)
- **Market Position:** Leader intelligence économique micro-SaaS (Vision Brief)

### Technical Quality Gates
- **Test Coverage:** >80% pour features core
- **Security Compliance:** RGPD compliant + encryption
- **Scalability:** Support 10K utilisateurs simultanés
- **Data Processing:** <24h pour traitement nouvelles données

## Implementation Notes

### Technology Stack Constraints (Brief Validated)
- **Frontend:** Next.js (expertise équipe imposée)
- **Backend:** Supabase (optimisation coûts)
- **Infrastructure:** Hetzner + Docker (contrainte budget)
- **Payment:** Stripe (standard industrie)

### Risk Mitigation
- **API Dependencies:** Diversification sources (LinkedIn, HackerNews) planned
- **Scaling Costs:** Monitoring continu avec alertes budget
- **Data Quality:** A/B testing systématique algorithmes

### Success Measurement
- **Conversion Rate:** Tracking depuis landing jusqu'à abonnement payant
- **Retention Rate:** >85% après 30 jours (KPI Brief)
- **NPS Score:** >50 (KPI Brief)
- **CAC:** <50€ (KPI Brief)

---

## Traceability Matrix

| User Story | Brief Section | Business Objective | Success Metric |
|------------|---------------|-------------------|----------------|
| 1.1, 1.2 | Data Collection + Intelligence Engine | Data Accuracy >80% | Scoring precision |
| 2.1, 2.2 | User Interface & Experience | User Acquisition 200+ | Retention rate |
| 3.1 | Business Intelligence Reporting | Market Position Leader | User engagement |
| 4.1, 4.2 | Non-Functional Requirements | Revenue 4000€ MRR | Cost control |
| 5.1 | Monetization (implicit) | Revenue 4000€ MRR | Conversion rate |

## Next Steps

1. **Architecture Review:** Handoff vers Solution Architect pour technical design
2. **Stakeholder Validation:** Review avec entrepreneurs cibles (20 interviews Brief)
3. **Technical Feasibility:** Validation APIs Twitter/Reddit access
4. **Competitive Analysis:** Benchmark solutions existantes (action Brief)

---

**Document Status:** ✅ Ready for Solution Architect handoff  
**Validation Required:** Architecture technique et faisabilité APIs  
**Next Review:** 2025-08-15

---

# PERSONAL USE VERSION - LaunchRadar Personal Research Tool

**Date:** 2025-08-01  
**Product Manager:** Personal Research & Development  
**Project Phase:** Personal MVP Planning  
**Status:** Personal Adaptation v1.0  
**Budget:** 56€/month personal usage

---

## Personal Use Context

**Personal Research Vision:** Create a personal business intelligence tool to identify and evaluate market opportunities for future commercialization. Focus on individual research capabilities rather than multi-user SaaS platform.

**Personal Goals:**
- Identify emerging business opportunities before they become saturated
- Build personal knowledge base of market trends and patterns
- Evaluate business ideas with data-driven scoring
- Create personal pipeline of opportunities for future development

**Key Differences from Commercial Version:**
- Single user focus (no user management system)
- Personal dashboard and note-taking capabilities
- Reduced infrastructure costs (Supabase free tier initially)
- Export-focused for personal analysis tools
- Future-ready architecture for commercialization

## Personal User Stories

### Epic 1: Personal Data Collection & Intelligence

#### User Story P1.1: Personal Market Monitoring
**En tant que** chercheur d'opportunités personnelles, **je veux** surveiller automatiquement les sources pertinentes **pour** identifier des opportunités avant qu'elles ne deviennent populaires.

**Critères d'acceptation:**
- [ ] Surveillance automatique Twitter/Reddit avec mots-clés personnalisables
- [ ] Collection minimum 500 posts/jour (réduit de 1000 pour usage personnel)
- [ ] Filtres personnalisés basés sur mes domaines d'intérêt
- [ ] Données stockées localement avec possibilité d'export

**Estimation:** 5 Story Points | **Priorité:** High  
**Infrastructure:** Supabase free tier + VPS 20€/mois

#### User Story P1.2: Personal Opportunity Scoring
**En tant que** évaluateur d'opportunités, **je veux** un système de scoring personnalisable **pour** évaluer rapidement le potentiel des idées selon mes critères.

**Critères d'acceptation:**
- [ ] Scoring algorithm basé sur mes critères de sélection personnels
- [ ] Possibilité d'ajuster les poids des facteurs de scoring
- [ ] Classification par domaines d'intérêt personnels
- [ ] Historique des scores et évolution dans le temps

**Estimation:** 8 Story Points | **Priorité:** High  
**Focus:** Algorithme adaptable aux préférences personnelles

### Epic 2: Personal Research Dashboard

#### User Story P2.1: Personal Opportunity Dashboard
**En tant que** utilisateur personnel, **je veux** un dashboard personnel avec mes opportunités **pour** analyser et organiser mes recherches.

**Critères d'acceptation:**
- [ ] Dashboard personnel responsive avec vues personnalisables
- [ ] Système de tags et catégories personnelles
- [ ] Notes privées et évaluation personnelle pour chaque opportunité
- [ ] Export données en CSV/JSON pour analyse externe (Excel, Notion)

**Estimation:** 5 Story Points | **Priorité:** High  
**Focus:** Interface simple et efficace pour usage individuel

#### User Story P2.2: Personal Research Notes
**En tant que** chercheur, **je veux** prendre des notes détaillées sur chaque opportunité **pour** construire ma base de connaissances personnelle.

**Critères d'acceptation:**
- [ ] Système de notes avec formatage Markdown
- [ ] Tags et catégories personnalisables
- [ ] Recherche full-text dans mes notes
- [ ] Export notes pour intégration avec outils personnels (Obsidian, Notion)

**Estimation:** 3 Story Points | **Priorité:** Medium  
**Focus:** Integration avec workflow personnel de recherche

### Epic 3: Personal Business Intelligence

#### User Story P3.1: Personal Market Reports
**En tant que** analyste personnel, **je veux** générer mes propres rapports de tendances **pour** identifier les patterns et opportunités émergentes.

**Critères d'acceptation:**
- [ ] Génération de rapports personnalisés hebdomadaires
- [ ] Graphiques et visualisations des tendances détectées
- [ ] Comparaison temporelle des opportunités
- [ ] Export rapports en PDF pour archivage personnel

**Estimation:** 5 Story Points | **Priorité:** Low  
**Focus:** Génération automatique insights personnels

### Epic 4: Personal Technical Infrastructure

#### User Story P4.1: Lightweight Personal Infrastructure
**En tant que** utilisateur individuel, **je veux** une infrastructure simple et économique **pour** maintenir les coûts sous 56€/mois.

**Critères d'acceptation:**
- [ ] Déploiement sur VPS économique (Hetzner 20€/mois)
- [ ] Supabase free tier pour base de données (0€ initialement)
- [ ] Backup automatique de données personnelles
- [ ] Monitoring simple des coûts et performance

**Estimation:** 8 Story Points | **Priorité:** High  
**Budget:** 56€/mois maximum (vs 200€ version commerciale)

#### User Story P4.2: Personal Data Security
**En tant que** utilisateur personnel, **je veux** sécuriser mes données de recherche **pour** protéger mes idées et découvertes.

**Critères d'acceptation:**
- [ ] Chiffrement des données sensibles
- [ ] Backup personnel automatisé (cloud personnel)
- [ ] Authentification simple mais sécurisée
- [ ] Contrôle total sur mes données

**Estimation:** 3 Story Points | **Priorité:** Medium  
**Focus:** Sécurité personnelle plutôt que compliance RGPD

## Personal Roadmap

### Phase 1: Personal MVP (Semaines 1-3)
**Budget:** 20€/mois (VPS) + 0€ (Supabase free)
- **P1.1** - Personal Data Collection - Focus essentiel
- **P2.1** - Personal Dashboard - Interface minimale mais fonctionnelle
- **P4.1** - Personal Infrastructure - Setup économique

### Phase 2: Personal Research Tools (Semaines 4-6)
**Budget:** 20€/mois (VPS) + possiblement Supabase Pro si nécessaire
- **P1.2** - Personal Scoring System - Algorithme personnalisable
- **P2.2** - Research Notes System - Base de connaissances
- **P4.2** - Personal Security - Protection données

### Phase 3: Personal Intelligence (Semaines 7-8)
**Budget:** Reste sous 56€/mois
- **P3.1** - Personal Reports - Intelligence automatisée
- **Optimization** - Performance et expérience utilisateur
- **Preparation** - Architecture ready pour commercialisation future

### Phase 4: Commercialization Ready (Future)
- Multi-user architecture preparation
- Monetization system preparation
- Scaling infrastructure planning

## Personal Acceptance Criteria

### Personal Performance Targets
- **Response time:** <2 secondes (interface personnelle)
- **Data processing:** <12h pour nouvelles données (réduit pour usage personnel)
- **Uptime:** >95% (acceptable pour usage personnel)
- **Cost control:** <56€/mois STRICT

### Personal Success Metrics
- **Opportunities identified:** >50 nouvelles opportunités/mois
- **Quality scoring:** Précision >70% sur évaluation personnelle
- **Research efficiency:** 2x plus rapide qu'analyse manuelle
- **Knowledge base:** 500+ opportunités analysées en 6 mois

### Personal Quality Gates
- **Data ownership:** 100% contrôle de mes données
- **Export capability:** Toutes données exportables
- **Scalability:** Architecture prête pour commercialization
- **Cost efficiency:** ROI positif vs temps économisé

## Personal Implementation Notes

### Personal Technology Stack
- **Frontend:** Next.js (minimal UI, focus efficacité)
- **Backend:** Supabase free tier -> Pro si nécessaire
- **Infrastructure:** Hetzner VPS 20€/mois (CPX21)
- **Analytics:** Simple personal tracking (pas GA4)

### Personal Budget Allocation (56€/mois)
- **VPS Hetzner:** 20€/mois (CPX21 - 3 vCPU, 8GB RAM)
- **Supabase:** 0€/mois (free tier) -> 25€ si Pro requis
- **APIs (Twitter/Reddit):** 0€ (free tiers utilisés)
- **Domain:** 10€/an (~1€/mois)
- **Backup storage:** 5€/mois (personal cloud)
- **Buffer:** 25€/mois pour scaling

### Personal Risk Mitigation
- **Budget overrun:** Monitoring strict avec alertes 45€
- **Data loss:** Backup automatique quotidien
- **API limits:** Utilisation optimisée free tiers
- **Future scaling:** Architecture ready pour commercialization

## Personal Next Steps

1. **Personal MVP Setup:** Infrastructure économique et dashboard minimal
2. **Data Collection:** Focus sur sources pertinentes pour mes intérêts
3. **Personal Validation:** 30 jours d'usage pour validation utilité
4. **Commercial Assessment:** Evaluation potentiel commercialization après 3 mois

---

**Personal Version Status:** ✅ Ready for Personal Development  
**Budget Validation:** 56€/mois confirmed  
**Timeline:** 8 semaines pour version personnelle complète  
**Commercial Path:** Architecture prête pour scaling futur