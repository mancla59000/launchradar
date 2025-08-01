# LaunchRadar Code Style & Conventions

## Agent Design Patterns
- **MCP Enforcement**: All agents must use Context7 + Serena before responses
- **Evidence-Based**: All technical decisions with measurable justifications
- **No Emojis**: Professional, factual communication only
- **Documentation-First**: ADRs (Architecture Decision Records) for major decisions

## Architecture Standards
- **Long-term Focus**: "Systems designed for change, not current requirements"
- **Priority Order**: Maintainability → Scalability → Performance → Features
- **Validation**: Minimum 3 criteria justification per technology choice

## File Organization
- **Business Docs**: `/ai/` directory (project-brief.md, prd.md)
- **Architecture**: `/ai/architecture-doc.md` (to be created)
- **Agent Configs**: `/.claude/agents/` with MCP compliance
- **Workflows**: `/.claude/workflows/` for orchestration

## Quality Gates
- **MCP Usage Report**: Mandatory section in all technical responses
- **Context7 Integration**: Technology documentation research required
- **Serena Analysis**: Project structure and pattern analysis required
- **ADR Documentation**: Architecture Decision Records for major choices