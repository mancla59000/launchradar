# LaunchRadar Suggested Commands

## Agent Activation Commands
```bash
# Activate Solution Architect (current need)
/agents spawn solution-architect
/agents spawn architect-agent

# Other available agents
/agents spawn complexity-analyzer
/agents spawn bmad-orchestrator
/agents spawn frontend-agent
/agents spawn backend-agent
/agents spawn security-agent
/agents spawn performance-agent
```

## MCP Validation Commands
```bash
# Validate MCP compliance
python3 .claude/hooks/mcp-validator.py --validate-config

# Test agent with MCP enforcement
python3 .claude/hooks/mcp-validator.py --agent "architect-agent"

# Update agents to MCP compliance
.claude/scripts/update-agents-mcp.sh
```

## Architecture Specialist Commands
```bash
# Architecture analysis
/arch analyze [component]

# Create Architecture Decision Record
/arch adr [decision]

# Validate architecture completeness
/arch validate

# Compare technical choices
/arch tradeoffs [choice1] [choice2]
```

## Development Workflow
```bash
# Current project state check
ls ai/                    # Check business docs
cat ai/project-brief.md   # Business requirements
cat ai/prd.md            # Product requirements

# Next step: Architecture design
# -> architect-agent will create ai/architecture-doc.md
```

## Darwin System Commands
```bash
# File operations
ls -la                   # List files with permissions
find . -name "*.md"      # Find markdown files
grep -r "pattern" .      # Search in files
```