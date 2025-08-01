# Project Control Commands

## Master Commands

### /project init [idea]
**Usage:** `/project init --idea "Application de gestion de tâches avec IA" --mode auto`
**Description:** Initialise nouveau projet avec analyse de complexité automatique
**Orchestrator:** master-orchestrator
**Workflow:** project-initialization.md

### /project complexity
**Usage:** `/project complexity`
**Description:** Évalue manuellement la complexité du projet actuel
**Output:** Score de complexité détaillé + recommandation de mode

### /project mode [fast-track|full-bmad]
**Usage:** `/project mode full-bmad`
**Description:** Force un mode spécifique, bypasse l'analyse automatique
**Warning:** Utiliser avec précaution, peut créer des incohérences

### /project status
**Usage:** `/project status`
**Description:** État global du projet et de tous les agents actifs
**Output:** Dashboard complet avec métriques et progression

### /project handoff [from-phase] [to-phase]
**Usage:** `/project handoff planning development`
**Description:** Transition manuelle entre phases avec validation

## Phase Commands

### Planning Phase
```bash
/planning start          # Lance planning orchestrator
/planning status         # État agents planning (BA, PM, Architect)
/planning validate [artifact]  # Validation manuelle livrable
/planning handoff        # Transition vers développement
```

### Development Phase
```bash
/dev start              # Lance development orchestrator
/dev context [path]     # Analyse contextuelle fichier/dossier
/dev activate [specialist]  # Force activation spécialiste
/dev status             # État spécialistes actifs
/dev handoff            # Transition vers quality
```

### Quality Phase
```bash
/quality audit          # Audit qualité complet
/quality gates          # État des quality gates
/quality report         # Rapport détaillé qualité
/quality fix [issue]    # Guidance correction problème
```

## Specialist Commands

### Architecture
```bash
/arch design           # Lance conception architecture
/arch patterns         # Suggère design patterns
/arch review           # Review architecture existante
/arch adr [decision]   # Crée Architecture Decision Record
```

### Frontend
```bash
/ui component [name]   # Crée nouveau composant
/ui optimize           # Optimisation performance UI
/ui audit             # Audit accessibilité + performance
/ui storybook         # Génère stories Storybook
```

### Backend
```bash
/api design           # Conception API REST/GraphQL
/api test             # Tests endpoints API
/api security         # Audit sécurité backend
/api docs             # Génère documentation API
```

## Agent Management

### /agents list
**Usage:** `/agents list --active`
**Description:** Liste tous les agents disponibles ou actifs
**Filters:** `--active`, `--inactive`, `--by-phase [planning|dev|quality]`

### /agents spawn [agent-name]
**Usage:** `/agents spawn frontend-specialist`
**Description:** Active manuellement un agent spécifique
**Context:** Charge automatiquement le contexte approprié

### /agents context [agent-name]
**Usage:** `/agents context architect-specialist`
**Description:** Affiche le contexte actuel d'un agent

### /agents kill [agent-name]
**Usage:** `/agents kill backend-specialist`
**Description:** Désactive un agent (WARNING: peut casser le workflow)

## Utility Commands

### /workflow show [phase]
**Usage:** `/workflow show planning`
**Description:** Affiche le workflow détaillé d'une phase

### /context update [phase] [key=value]
**Usage:** `/context update development stack=nextjs`
**Description:** Met à jour le contexte d'une phase

### /templates list [category]
**Usage:** `/templates list bmad`
**Description:** Liste les templates disponibles (BMAD, SuperClaude, custom)

### /help hybrid
**Usage:** `/help hybrid`
**Description:** Aide détaillée sur l'architecture Hybrid Agile-Contextual