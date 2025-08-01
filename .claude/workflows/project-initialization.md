# Project Initialization Workflow

## Workflow Overview
Processus automatisé d'initialisation d'un nouveau projet avec analyse de complexité et activation du mode approprié.

## Trigger Command
```
/project init --idea "[DESCRIPTION]" --mode [auto|fast-track|full-bmad] --verbose
```

## Workflow Steps

### 1. Complexity Analysis (Master Orchestrator)
```yaml
complexity_matrix:
  technical_complexity: 
    - simple: "1-2 technologies, stack standard"
    - medium: "3-5 technologies, quelques intégrations"
    - complex: "6+ technologies, architecture complexe"
  timeline:
    - short: "< 1 semaine"
    - medium: "1-4 semaines" 
    - long: "> 1 mois"
  team_size:
    - solo: "1 développeur"
    - small: "2-5 développeurs"
    - large: "6+ développeurs"
  domain_complexity:
    - standard: "Domaine connu, patterns établis"
    - specialized: "Domaine spécifique, expertise requise"
    - expert: "R&D, innovation, domain expertise critique"
```

### 2. Mode Decision Logic
```python
def calculate_complexity_score(answers):
    score = 0
    score += answers['technical_complexity']  # 1-3
    score += answers['timeline']              # 1-3
    score += answers['team_size']             # 1-3
    score += answers['domain_complexity']     # 1-3
    
    if score <= 6:
        return "fast-track"
    else:
        return "full-bmad"
```

### 3. Fast-Track Mode Activation
```yaml
fast_track_workflow:
  activated_agents: [architect-specialist, frontend-specialist, backend-specialist]
  approach: "Contextual SuperClaude activation"
  documentation: "Minimal but focused"
  timeline: "Rapid prototyping → MVP → iteration"
```

### 4. Full BMAD Mode Activation
```yaml
full_bmad_workflow:
  phase_1_planning:
    orchestrator: planning-orchestrator
    agents: [business-analyst, product-manager, solution-architect]
    deliverables: [project-brief, prd, architecture-doc]
  
  phase_2_development:
    orchestrator: development-orchestrator
    agents: [frontend-specialist, backend-specialist, devops-specialist]
    deliverables: [mvp, tests, documentation]
  
  phase_3_quality:
    orchestrator: quality-orchestrator
    agents: [security-auditor, test-engineer, code-reviewer]
    deliverables: [security-report, test-results, quality-metrics]
```

## Context Files Created
- `.claude/context/project-context.md` - Vision et objectifs
- `.claude/context/complexity-analysis.md` - Résultats de l'analyse
- `.claude/context/active-mode.md` - Mode choisi et justification
- `ai/project-brief.md` - Brief projet (si mode Full BMAD)

## Success Criteria
- Mode approprié sélectionné selon complexité
- Agents nécessaires activés et contextualisés
- Documentation de base créée
- Workflow suivant clairement défini