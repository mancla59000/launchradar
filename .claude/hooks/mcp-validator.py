#!/usr/bin/env python3
"""
🔒 MCP USAGE VALIDATOR - Système de validation automatique
Valide que chaque agent utilise Context7 et Serena de manière obligatoire.
"""

import re
import json
import sys
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path

@dataclass
class MCPValidationResult:
    """Résultat validation MCP pour un agent."""
    agent_name: str
    context7_used: bool
    serena_used: bool
    mcp_report_present: bool
    validation_passed: bool
    errors: List[str]
    warnings: List[str]

class MCPValidator:
    """Validateur usage MCP obligatoire pour agents."""
    
    # Patterns MCP obligatoires
    CONTEXT7_PATTERNS = [
        r'mcp__context7__resolve-library-id',
        r'mcp__context7__get-library-docs',
    ]
    
    SERENA_PATTERNS = [
        r'mcp__serena__get_symbols_overview',
        r'mcp__serena__search_for_pattern', 
        r'mcp__serena__find_symbol',
        r'mcp__serena__list_dir',
        r'mcp__serena__get_current_config',
    ]
    
    MCP_REPORT_PATTERN = r'MCP Usage Report:'
    
    def __init__(self, enforcement_level: str = "blocking"):
        """
        Initialize validator.
        
        Args:
            enforcement_level: "warning" | "blocking" | "auto-injection"
        """
        self.enforcement_level = enforcement_level
        self.validation_results: List[MCPValidationResult] = []
    
    def validate_agent_response(self, agent_name: str, response_content: str) -> MCPValidationResult:
        """
        Valide qu'une réponse d'agent utilise MCP de manière obligatoire.
        
        Args:
            agent_name: Nom de l'agent
            response_content: Contenu de la réponse à valider
            
        Returns:
            MCPValidationResult avec détails validation
        """
        errors = []
        warnings = []
        
        # Vérification Context7 usage
        context7_used = any(
            re.search(pattern, response_content, re.IGNORECASE) 
            for pattern in self.CONTEXT7_PATTERNS
        )
        
        # Vérification Serena usage  
        serena_used = any(
            re.search(pattern, response_content, re.IGNORECASE)
            for pattern in self.SERENA_PATTERNS
        )
        
        # Vérification MCP Usage Report
        mcp_report_present = bool(
            re.search(self.MCP_REPORT_PATTERN, response_content, re.IGNORECASE)
        )
        
        # Collecte erreurs
        if not context7_used:
            errors.append(f"Agent {agent_name} n'a pas utilisé Context7 (obligatoire)")
            
        if not serena_used:
            errors.append(f"Agent {agent_name} n'a pas utilisé Serena (obligatoire)")
            
        if not mcp_report_present:
            errors.append(f"Agent {agent_name} n'a pas inclus 'MCP Usage Report' (obligatoire)")
        
        # Warnings pour usage partiel
        if context7_used and len([p for p in self.CONTEXT7_PATTERNS if re.search(p, response_content)]) < 2:
            warnings.append(f"Agent {agent_name} usage Context7 incomplet (resolve-library-id + get-library-docs recommandés)")
            
        if serena_used and len([p for p in self.SERENA_PATTERNS if re.search(p, response_content)]) < 2:
            warnings.append(f"Agent {agent_name} usage Serena minimal (plusieurs tools recommandés)")
        
        # Validation globale
        validation_passed = context7_used and serena_used and mcp_report_present
        
        result = MCPValidationResult(
            agent_name=agent_name,
            context7_used=context7_used,
            serena_used=serena_used, 
            mcp_report_present=mcp_report_present,
            validation_passed=validation_passed,
            errors=errors,
            warnings=warnings
        )
        
        self.validation_results.append(result)
        return result
    
    def validate_agent_file(self, agent_file_path: str) -> MCPValidationResult:
        """
        Valide qu'un fichier agent inclut les tools MCP obligatoires.
        
        Args:
            agent_file_path: Chemin vers fichier agent .md
            
        Returns:
            MCPValidationResult pour configuration agent
        """
        try:
            with open(agent_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except FileNotFoundError:
            return MCPValidationResult(
                agent_name=Path(agent_file_path).stem,
                context7_used=False,
                serena_used=False,
                mcp_report_present=False,
                validation_passed=False,
                errors=[f"Fichier agent non trouvé: {agent_file_path}"],
                warnings=[]
            )
        
        agent_name = Path(agent_file_path).stem
        errors = []
        warnings = []
        
        # Vérification tools section inclut MCP
        tools_section = re.search(r'tools:\s*([^\n]+)', content, re.IGNORECASE)
        
        context7_configured = False
        serena_configured = False
        
        if tools_section:
            tools_content = tools_section.group(1)
            context7_configured = 'mcp__context7' in tools_content
            serena_configured = 'mcp__serena' in tools_content
        
        # Vérification MCP enforcement section présente
        mcp_enforcement_present = 'MCP ENFORCEMENT' in content or 'MCP USAGE OBLIGATOIRE' in content
        
        if not context7_configured:
            errors.append(f"Agent {agent_name} n'inclut pas tools Context7 dans configuration")
            
        if not serena_configured:
            errors.append(f"Agent {agent_name} n'inclut pas tools Serena dans configuration")
            
        if not mcp_enforcement_present:
            warnings.append(f"Agent {agent_name} n'a pas section MCP enforcement explicite")
        
        validation_passed = context7_configured and serena_configured
        
        return MCPValidationResult(
            agent_name=agent_name,
            context7_used=context7_configured,
            serena_used=serena_configured, 
            mcp_report_present=mcp_enforcement_present,
            validation_passed=validation_passed,
            errors=errors,
            warnings=warnings
        )
    
    def validate_all_agents(self, agents_dir: str = ".claude/agents") -> Dict[str, MCPValidationResult]:
        """
        Valide tous les agents dans le répertoire.
        
        Args:
            agents_dir: Répertoire contenant les agents
            
        Returns:
            Dict des résultats validation par agent
        """
        agents_path = Path(agents_dir)
        results = {}
        
        for agent_file in agents_path.glob("*.md"):
            if agent_file.name == "README.md":
                continue
                
            result = self.validate_agent_file(str(agent_file))
            results[result.agent_name] = result
        
        return results
    
    def enforce_mcp_usage(self, agent_name: str, response_content: str) -> Tuple[bool, str]:
        """
        Enforce MCP usage selon niveau configuré.
        
        Args:
            agent_name: Nom agent
            response_content: Contenu réponse
            
        Returns:
            (allowed, message) - Si réponse autorisée et message explicatif
        """
        result = self.validate_agent_response(agent_name, response_content)
        
        if self.enforcement_level == "warning":
            # Mode warning : permet réponse mais log
            if not result.validation_passed:
                warning_msg = f"⚠️  WARNING: {agent_name} MCP usage incomplet\n"
                warning_msg += "\n".join(f"  - {error}" for error in result.errors)
                return True, warning_msg
            return True, f"✅ {agent_name} MCP usage validé"
        
        elif self.enforcement_level == "blocking":
            # Mode blocking : refuse réponse si MCP non utilisé
            if not result.validation_passed:
                error_msg = f"❌ BLOCKED: {agent_name} doit utiliser MCP Context7 ET Serena\n"
                error_msg += "\n".join(f"  - {error}" for error in result.errors)
                error_msg += f"\n\n🔒 Usage MCP obligatoire. Retry avec appels MCP requis."
                return False, error_msg
            return True, f"✅ {agent_name} MCP compliance validé"
        
        elif self.enforcement_level == "auto-injection":
            # Mode auto-injection : ajoute MCP calls si manquants
            if not result.validation_passed:
                injected_content = self._auto_inject_mcp_calls(agent_name, response_content)
                return True, injected_content
            return True, response_content
        
        return True, response_content
    
    def _auto_inject_mcp_calls(self, agent_name: str, content: str) -> str:
        """Auto-injection MCP calls si manquants (mode fallback)."""
        
        injected_content = content
        
        # Injection Context7 si manquant
        if not any(re.search(p, content) for p in self.CONTEXT7_PATTERNS):
            context7_injection = """
## Auto-Injected Context7 Research

```bash
mcp__context7__resolve-library-id --libraryName "project-frameworks"
mcp__context7__get-library-docs --context7CompatibleLibraryID "[resolved-id]" --topic "patterns"
```
"""
            injected_content = context7_injection + injected_content
        
        # Injection Serena si manquant
        if not any(re.search(p, content) for p in self.SERENA_PATTERNS):
            serena_injection = """
## Auto-Injected Serena Analysis

```bash
mcp__serena__get_symbols_overview --relative_path "."
mcp__serena__search_for_pattern --substring_pattern "relevant-pattern"
```
"""
            injected_content = serena_injection + injected_content
        
        # Injection MCP Usage Report si manquant
        if not re.search(self.MCP_REPORT_PATTERN, content):
            mcp_report = """

## MCP Usage Report (Auto-Injected)
```yaml
context7_calls: "Auto-injected for compliance"
serena_calls: "Auto-injected for compliance"  
integration_quality: "Automatic MCP integration applied"
```
"""
            injected_content += mcp_report
        
        return injected_content
    
    def generate_compliance_report(self) -> str:
        """Génère rapport compliance MCP pour tous agents."""
        
        if not self.validation_results:
            return "Aucune validation MCP effectuée."
        
        total_agents = len(self.validation_results)
        passed_agents = sum(1 for r in self.validation_results if r.validation_passed)
        
        report = f"""
🔒 MCP COMPLIANCE REPORT
========================

Total Agents: {total_agents}  
Compliant: {passed_agents}/{total_agents} ({passed_agents/total_agents*100:.1f}%)
Enforcement Level: {self.enforcement_level.upper()}

## Détail par Agent:
"""
        
        for result in self.validation_results:
            status = "✅ PASS" if result.validation_passed else "❌ FAIL"
            report += f"\n### {result.agent_name} - {status}\n"
            report += f"- Context7: {'✅' if result.context7_used else '❌'}\n"
            report += f"- Serena: {'✅' if result.serena_used else '❌'}\n" 
            report += f"- MCP Report: {'✅' if result.mcp_report_present else '❌'}\n"
            
            if result.errors:
                report += f"- Errors: {len(result.errors)}\n"
                for error in result.errors:
                    report += f"  * {error}\n"
            
            if result.warnings:
                report += f"- Warnings: {len(result.warnings)}\n"
                for warning in result.warnings:
                    report += f"  * {warning}\n"
        
        return report

def main():
    """CLI pour validation MCP agents."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validation MCP usage agents')
    parser.add_argument('--agents-dir', default='.claude/agents', help='Répertoire agents')
    parser.add_argument('--enforcement', choices=['warning', 'blocking', 'auto-injection'], 
                       default='blocking', help='Niveau enforcement')
    parser.add_argument('--validate-config', action='store_true', 
                       help='Valide configuration agents (pas runtime)')
    
    args = parser.parse_args()
    
    validator = MCPValidator(enforcement_level=args.enforcement)
    
    if args.validate_config:
        # Validation configuration agents
        results = validator.validate_all_agents(args.agents_dir)
        
        print("🔒 VALIDATION CONFIGURATION MCP AGENTS")
        print("=" * 50)
        
        for agent_name, result in results.items():
            status = "✅ PASS" if result.validation_passed else "❌ FAIL"
            print(f"{agent_name}: {status}")
            
            if result.errors:
                for error in result.errors:
                    print(f"  ❌ {error}")
            
            if result.warnings:
                for warning in result.warnings:
                    print(f"  ⚠️  {warning}")
        
        # Statistiques globales
        total = len(results)
        passed = sum(1 for r in results.values() if r.validation_passed)
        print(f"\n📊 RÉSUMÉ: {passed}/{total} agents configurés correctement ({passed/total*100:.1f}%)")
        
        # Exit code selon résultats  
        sys.exit(0 if passed == total else 1)
    
    else:
        print("Usage: python mcp-validator.py --validate-config")
        print("Pour validation runtime, utiliser comme module Python")

if __name__ == "__main__":
    main()