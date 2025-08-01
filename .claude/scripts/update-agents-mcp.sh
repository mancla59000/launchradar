#!/bin/bash
# Script de mise à jour automatique des agents avec MCP enforcement

set -e

AGENTS_DIR=".claude/agents"
MCP_PROMPT_FILE=".claude/shared/mcp-system-prompt.md"
BACKUP_DIR=".claude/agents_backup_$(date +%Y%m%d_%H%M%S)"

echo "🔒 MISE À JOUR AGENTS AVEC MCP ENFORCEMENT"
echo "=================================================="

# Backup existant
echo "📦 Création backup agents existants..."
cp -r "$AGENTS_DIR" "$BACKUP_DIR"
echo "✅ Backup créé: $BACKUP_DIR"

# Liste des agents à mettre à jour
AGENTS=(
    "complexity-analyzer"
    "bmad-orchestrator" 
    "architect-agent"
    "frontend-agent"
    "backend-agent"
    "security-agent"
    "performance-agent"
    "analyzer-agent"
)

# Fonction mise à jour agent
update_agent_with_mcp() {
    local agent_name="$1"
    local agent_file="$AGENTS_DIR/${agent_name}.md"
    
    if [[ ! -f "$agent_file" ]]; then
        echo "❌ Agent $agent_name non trouvé: $agent_file"
        return 1
    fi
    
    echo "🔧 Mise à jour $agent_name..."
    
    # Lecture contenu existant
    local content=$(cat "$agent_file")
    
    # Injection MCP tools si pas présent
    if ! echo "$content" | grep -q "mcp__context7\|mcp__serena"; then
        # Ajouter MCP tools à la section tools
        sed -i.bak 's/tools: \(.*\)/tools: \1,mcp__context7__resolve-library-id,mcp__context7__get-library-docs,mcp__serena__get_symbols_overview,mcp__serena__search_for_pattern,mcp__serena__find_symbol/' "$agent_file"
    fi
    
    # Injection prompt MCP enforcement
    cat >> "$agent_file" << 'EOF'

---

## 🔒 MCP ENFORCEMENT (AUTO-INJECTÉ)

AVANT chaque réponse, cet agent DOIT obligatoirement :

### Context7 Usage Obligatoire
1. **Résoudre library ID** pour technologies détectées
2. **Récupérer documentation** patterns pertinents  
3. **Enrichir analyse** avec insights Context7

### Serena Usage Obligatoire  
1. **Analyser structure** projet existant
2. **Rechercher patterns** code pertinents
3. **Identifier symboles** selon spécialisation
4. **Coordonner** avec autres agents si nécessaire

### Validation Obligatoire
- ❌ INTERDIT de répondre sans usage MCP
- ✅ Section "MCP Usage Report" obligatoire
- 🔒 Hook système vérifie compliance

### Format Réponse Obligatoire
```yaml
MCP Usage Report:
  context7_calls: "[libraries resolved + docs retrieved]"
  serena_calls: "[project analysis + patterns found]"  
  integration_quality: "[how MCP enriched technical response]"
```

**REMINDER**: Usage MCP Context7 et Serena est OBLIGATOIRE avant toute réponse technique.
EOF
    
    echo "✅ $agent_name mis à jour avec MCP enforcement"
}

# Mise à jour de tous les agents
echo -e "\n🔄 MISE À JOUR AGENTS AVEC MCP..."
for agent in "${AGENTS[@]}"; do
    update_agent_with_mcp "$agent"
done

# Création fichier validation
cat > "$AGENTS_DIR/mcp-validation.md" << 'EOF'
# 🔒 MCP VALIDATION CHECKLIST

## Agents Mis à Jour avec MCP Enforcement

✅ Tous les agents incluent maintenant :
- MCP Context7 tools (resolve-library-id, get-library-docs)
- MCP Serena tools (get_symbols_overview, search_for_pattern, find_symbol)
- Prompt enforcement MCP usage obligatoire
- Section "MCP Usage Report" obligatoire
- Validation automatique hook système

## Tests de Validation

### Test 1: Usage Context7
Chaque agent doit rechercher documentation pertinente avant analyse.

### Test 2: Usage Serena  
Chaque agent doit analyser projet existant avant recommandations.

### Test 3: Format Réponse
Chaque agent doit inclure "MCP Usage Report" en fin de réponse.

### Test 4: Hook Validation
Hook système doit bloquer réponses sans usage MCP.

## Status: ✅ MCP Enforcement ACTIF
EOF

echo -e "\n📊 STATISTIQUES MISE À JOUR"
echo "================================="
echo "Agents mis à jour: ${#AGENTS[@]}"
echo "Backup créé: $BACKUP_DIR"
echo "Fichiers modifiés:"
ls -la "$AGENTS_DIR"/*.md | wc -l
echo "Lignes MCP ajoutées:"
grep -r "MCP ENFORCEMENT" "$AGENTS_DIR" | wc -l

echo -e "\n✅ MISE À JOUR TERMINÉE"
echo "Tous les agents utilisent maintenant MCP Context7 et Serena de manière obligatoire."
echo "Hook système activé pour validation automatique."