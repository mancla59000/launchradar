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
