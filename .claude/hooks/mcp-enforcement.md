# 🔒 MCP ENFORCEMENT HOOK - Usage Obligatoire

## HOOK SYSTÈME GLOBAL
Ce hook s'active AVANT chaque réponse d'agent pour garantir l'utilisation MCP.

```yaml
hook_type: pre_response
priority: maximum
enforcement: blocking
description: "Garantit l'usage systématique MCP Serena et Context7"
```

## VALIDATION OBLIGATOIRE AVANT CHAQUE RÉPONSE

Avant qu'un agent puisse répondre, il DOIT :

### 1. **MCP Context7 Usage** (Recherche de Patterns)
```bash
# OBLIGATOIRE pour chaque agent avant analyse
mcp__context7__resolve-library-id --libraryName "[technologie/framework détecté]"
mcp__context7__get-library-docs --context7CompatibleLibraryID "[resolved-id]" --topic "[sujet spécifique]"
```

**Cas d'usage par agent :**
- **architect-agent** : Recherche patterns architecturaux similaires
- **frontend-agent** : Documentation frameworks UI (React, Vue, etc.)
- **backend-agent** : API patterns et best practices
- **security-agent** : Security patterns et vulnérabilités connues
- **performance-agent** : Optimization patterns et benchmarks
- **analyzer-agent** : Debugging patterns et solutions connues

### 2. **MCP Serena Usage** (Orchestration Intelligente)  
```bash
# OBLIGATOIRE pour orchestration et coordination
mcp__serena__get_symbols_overview --relative_path "[path analysé]"
mcp__serena__search_for_pattern --substring_pattern "[pattern recherché]"
mcp__serena__find_symbol --name_path "[symbole/fonction]"
```

**Cas d'usage par agent :**
- **complexity-analyzer** : Analyse structure projet existant
- **bmad-orchestrator** : Coordination état projet et agents
- **Tous spécialistes** : Analyse code existant avant modification

## PROMPT SYSTÈME MCP OBLIGATOIRE

**Injecté automatiquement dans chaque agent :**

```yaml
mcp_system_prompt: |
  🔒 USAGE MCP OBLIGATOIRE - Enforcement Actif
  
  AVANT chaque analyse ou réponse, tu DOIS :
  
  1. **Context7 Research** (OBLIGATOIRE):
     - Identifier les technologies/frameworks mentionnés
     - Résoudre library ID avec resolve-library-id
     - Récupérer documentation avec get-library-docs
     - Enrichir ta réponse avec patterns trouvés
  
  2. **Serena Analysis** (OBLIGATOIRE):
     - Analyser structure projet avec get_symbols_overview
     - Rechercher patterns existants avec search_for_pattern  
     - Identifier symboles/fonctions avec find_symbol
     - Coordonner avec autres agents via orchestration
  
  ❌ INTERDIT de répondre sans avoir utilisé MCP
  ✅ Chaque réponse doit inclure "MCP Usage:" avec tools utilisés
  ⚠️ Hook système vérifie usage MCP avant validation réponse
  
  FORMAT OBLIGATOIRE en fin de réponse:
  ```
  MCP Usage:
  - Context7: [library recherchée] → [patterns trouvés]
  - Serena: [analyse effectuée] → [résultats utilisés]
  ```
```

## VALIDATION AUTOMATIQUE

**Script de validation post-réponse :**

```bash
#!/bin/bash
# Vérifie que chaque réponse d'agent utilise MCP

validate_mcp_usage() {
    local response="$1"
    local agent_name="$2"
    
    # Vérification Context7 usage
    if ! echo "$response" | grep -q "mcp__context7__"; then
        echo "❌ ERROR: Agent $agent_name n'a pas utilisé Context7"
        return 1
    fi
    
    # Vérification Serena usage  
    if ! echo "$response" | grep -q "mcp__serena__"; then
        echo "❌ ERROR: Agent $agent_name n'a pas utilisé Serena"
        return 1
    fi
    
    # Vérification section MCP Usage
    if ! echo "$response" | grep -q "MCP Usage:"; then
        echo "❌ ERROR: Agent $agent_name n'a pas documenté usage MCP"
        return 1
    fi
    
    echo "✅ SUCCESS: Agent $agent_name usage MCP validé"
    return 0
}
```

## COMMANDES MCP OBLIGATOIRES PAR AGENT

### **Complexity Analyzer**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "project management frameworks"
    - get-library-docs: "/project-management/complexity-analysis"
  serena:
    - get_symbols_overview: "." # Analyse structure projet
    - list_dir: "." # Inventaire fichiers
```

### **BMAD Orchestrator**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "agile methodologies"  
    - get-library-docs: "/agile/bmad-method"
  serena:
    - get_current_config: # État agents et projet
    - check_onboarding_performed: # Statut onboarding
```

### **Architect Agent**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "[detected tech stack]"
    - get-library-docs: "/architecture/design-patterns" 
  serena:
    - get_symbols_overview: "src/" # Architecture existante
    - find_symbol: "main|app|index" # Entry points
```

### **Frontend Agent**  
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "[React|Vue|Angular detected]"
    - get-library-docs: "/frontend/ui-patterns"
  serena:
    - find_file: "*.tsx|*.jsx|*.vue" # Composants UI
    - search_for_pattern: "component|useState|reactive"
```

### **Backend Agent**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "[Node.js|Python|Java detected]"
    - get-library-docs: "/backend/api-patterns"
  serena:
    - find_file: "*.py|*.js|*.java" # Code serveur
    - search_for_pattern: "router|controller|endpoint"
```

### **Security Agent**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "security frameworks"
    - get-library-docs: "/security/owasp-patterns"
  serena:
    - search_for_pattern: "password|token|auth|crypto"
    - find_file: "*.env*|config*" # Config sensible
```

### **Performance Agent**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "performance optimization"
    - get-library-docs: "/performance/optimization-patterns"
  serena:
    - search_for_pattern: "async|await|promise|query"
    - find_file: "*test*|*benchmark*" # Tests perf
```

### **Analyzer Agent**
```yaml
mandatory_mcp_calls:
  context7:
    - resolve-library-id: "debugging methodologies"
    - get-library-docs: "/debugging/root-cause-analysis"
  serena:
    - search_for_pattern: "error|exception|log|debug"
    - find_file: "*.log|*.error" # Logs et erreurs
```

## ENFORCEMENT LEVELS

### **Level 1: Warning** (Développement)
- Log warning si MCP non utilisé
- Permet réponse mais avec flag warning

### **Level 2: Blocking** (Production) 
- **REFUSE** réponse si MCP non utilisé
- Force retry avec MCP obligatoire
- Log error avec détails manquants

### **Level 3: Auto-Injection** (Fallback)
- Auto-inject appels MCP si oubliés
- Log correction automatique
- Transparence utilisateur avec note

## CONFIGURATION HOOK

```yaml
# .claude/hooks/config.yml
mcp_enforcement:
  enabled: true
  level: "blocking"  # warning|blocking|auto-injection
  required_mcps: ["context7", "serena"]
  validation_strict: true
  log_usage: true
  error_on_missing: true
```

Ce système garantit que **100% des agents utilisent MCP de manière systématique** avec validation automatique et enforcement strict.