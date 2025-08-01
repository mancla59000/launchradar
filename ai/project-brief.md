# LaunchRadar - Project Brief

**Date:** 2024-08-01  
**Business Analyst:** BMAD Framework Business Analyst  
**Project Phase:** Planning  
**Status:** Draft v1.0  

---

## Executive Summary

LaunchRadar est une plateforme SaaS d'intelligence économique spécialisée dans l'identification automatisée des opportunités de marché micro-SaaS. En surveillant les conversations sur Twitter et Reddit, la plateforme détecte, analyse et score les projets émergents pour fournir aux entrepreneurs des insights actionnables sur les tendances du marché.

## Business Vision & Objectives

### Vision Statement
"Devenir la référence en intelligence économique automatisée pour l'écosystème micro-SaaS francophone et international."

### Primary Business Objectives
1. **Revenue Goal**: Atteindre 4 000€ MRR dans les 12 mois
2. **Market Position**: S'établir comme leader sur le créneau intelligence économique micro-SaaS
3. **User Acquisition**: Acquérir 200 utilisateurs payants actifs
4. **Data Accuracy**: Maintenir un taux de précision du scoring > 80%

### Success Metrics (KPIs)
- **Financial**: MRR growth rate > 20%/mois, CAC < 50€
- **Product**: Précision scoring > 80%, uptime > 99.5%
- **User**: NPS > 50, retention rate > 85% après 30 jours
- **Operational**: Coûts infrastructure < 200€/mois

## Market Analysis

### Target Market
- **Primary**: Entrepreneurs solo et équipes micro-SaaS (2-10 personnes)
- **Secondary**: VCs et investisseurs spécialisés early-stage
- **Tertiary**: Consultants en stratégie digitale

### Market Size Estimation
- **TAM**: Marché global entrepreneurs digitaux (~2M personnes)
- **SAM**: Entrepreneurs micro-SaaS actifs (~200K personnes)
- **SOM**: Early adopters avec budget R&D (~10K personnes)

### Value Proposition
**"Identifiez les opportunités SaaS avant vos concurrents grâce à l'IA"**

- **Veille automatisée 24/7** sur signaux faibles du marché
- **Scoring prédictif de traction** basé sur l'engagement communautaire
- **Alerts personnalisées** selon vos domaines d'expertise
- **Intelligence compétitive** sur les revenus et croissance

## Stakeholder Analysis

### Primary Stakeholders
| Stakeholder | Influence | Interest | Engagement Strategy |
|-------------|-----------|----------|-------------------|
| Solo Entrepreneurs | High | High | Product-led growth, community |
| Micro-SaaS Teams | High | High | B2B sales, partnerships |
| Tech Communities | Medium | High | Content marketing, sponsoring |

### Secondary Stakeholders
| Stakeholder | Influence | Interest | Engagement Strategy |
|-------------|-----------|----------|-------------------|
| VCs/Investors | Medium | Medium | Thought leadership, reports |
| Tech Influencers | Medium | Low | PR, exclusive access |
| Platform APIs | Low | High | Technical partnerships |

## Business Requirements

### Functional Requirements
1. **Data Collection System**
   - Scraping automatisé Twitter (API v2) et Reddit (API)
   - Filtrage par mots-clés (#buildinpublic, #indiehackers, MRR, revenue)
   - Collecte 24/7 avec rate limiting intelligent

2. **Intelligence Analysis Engine**
   - Scoring de traction basé sur engagement, croissance, mentions
   - Détection de patterns de succès/échec
   - Classification automatique par vertical/industrie

3. **User Interface & Experience**
   - Dashboard temps réel avec métriques visuelles
   - Système d'alertes personnalisables
   - Export de données (CSV, API)
   - Mobile-responsive design

4. **Business Intelligence Reporting**
   - Digest quotidien automatisé
   - Rapports hebdomadaires de tendances
   - KPI dashboard avec Metabase integration

### Non-Functional Requirements
1. **Performance**
   - Temps de traitement < 24h pour nouvelles données
   - Page load time < 3 secondes
   - API response time < 500ms

2. **Scalability**
   - Support jusqu'à 10K utilisateurs simultanés
   - Traitement 100K posts/jour
   - Auto-scaling infrastructure

3. **Security & Compliance**
   - RGPD compliance pour données EU
   - API rate limiting et authentification
   - Data encryption at rest et in transit

## Technical Constraints & Assumptions

### Technical Stack Constraints
- **Frontend**: Next.js (imposed - team expertise)
- **Backend**: Supabase (cost optimization)
- **Infrastructure**: Hetzner + Docker (budget constraint)
- **Payment**: Stripe (standard industry choice)

### Budget Constraints
- **Monthly OpEx**: Maximum 200€/mois
- **Development Budget**: Bootstrapped (time vs. money trade-off)
- **Marketing Budget**: Maximum 500€/mois les 6 premiers mois

### Key Assumptions
1. Twitter/Reddit APIs restent accessibles aux conditions actuelles
2. Hetzner infrastructure scale selon la croissance utilisateurs
3. Market demand existe pour ce type d'intelligence économique
4. Équipe solo peut maintenir la vélocité de développement

## Risk Analysis

### High Risk
- **API Dependencies**: Changements de politique Twitter/Reddit
- **Competitive Response**: Entrée de gros acteurs (Google, Microsoft)
- **Data Quality**: Précision du scoring avec données bruitées

### Medium Risk
- **Technical Debt**: Complexité croissante du système de scoring
- **Scaling Costs**: Croissance des coûts infrastructure
- **User Acquisition**: Difficulté à atteindre early adopters

### Mitigation Strategies
- Diversification des sources de données (LinkedIn, HackerNews)
- Monitoring compétitif et différenciation continue
- A/B testing systématique des algorithmes de scoring

## Timeline & Milestones

### Phase 1 - MVP (Mois 1-2)
- Setup infrastructure et pipeline de base
- Scraping Twitter/Reddit fonctionnel
- Interface utilisateur minimaliste
- Système de scoring v1.0

### Phase 2 - Product-Market Fit (Mois 3-4)
- Optimisation algorithmes de scoring
- Système d'alertes avancé
- Onboarding et UX optimization
- Intégration paiements Stripe

### Phase 3 - Scale (Mois 5-6)
- API publique pour développeurs
- Intégrations tierces (Slack, Discord)
- Advanced analytics et reporting
- International expansion (EN)

## Budget Allocation

### Development (80% - 160€/mois)
- Infrastructure Hetzner: 60€/mois
- APIs Twitter/Reddit: 50€/mois
- Tools & Software: 50€/mois

### Marketing & Growth (20% - 40€/mois)
- Content creation tools: 20€/mois
- Community building: 20€/mois

## Next Steps & Handoff

### Immediate Actions Required
1. **Validation Business Case**: Interview 20 entrepreneurs cibles
2. **Technical Feasibility**: Validation faisabilité APIs Twitter/Reddit
3. **Competitive Analysis**: Benchmark solutions existantes

### Handoff to Product Manager
- **Artifact**: Ce project brief validé
- **Context**: Vision métier et contraintes clarifiées
- **Next Phase**: Création du PRD (Product Requirements Document)

---

**Document Status**: ✅ Ready for Product Manager handoff  
**Approval Required**: Stakeholder validation des assumptions clés  
**Next Review**: 2024-08-15