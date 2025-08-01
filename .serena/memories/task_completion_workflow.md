# LaunchRadar Task Completion Workflow

## When Architecture Task is Completed

### 1. Mandatory Deliverables
- **Architecture Document**: `ai/architecture-doc.md` created
- **ADRs**: Minimum 2 Architecture Decision Records
- **Technology Stack**: Justified with measurable criteria
- **Diagrams**: C4 Context, Container, Data Flow, Deployment
- **Database Schema**: Supabase tables and relationships defined

### 2. Validation Checklist
- [ ] MCP Usage Report included (Context7 + Serena calls)
- [ ] Each technology has minimum 3 justification criteria
- [ ] Performance targets quantified with metrics
- [ ] Scalability plan with concrete metrics
- [ ] Security architecture documented
- [ ] Docker infrastructure for Hetzner defined

### 3. Quality Gates
- [ ] No emojis used (professional communication)
- [ ] Evidence-based technical decisions
- [ ] Long-term maintainability considered
- [ ] Integration with Twitter/Reddit APIs planned
- [ ] Compliance with business constraints (Next.js, Supabase, Hetzner)

### 4. Handoff to Development Phase
- [ ] Technical specifications ready for implementation
- [ ] Database schema ready for Supabase setup
- [ ] API architecture defined
- [ ] Deployment strategy with Coolify documented
- [ ] Next agent identification (likely backend-agent for API setup)

### 5. Success Metrics
- Architecture supports 100K posts/day processing
- System scalable to 10K concurrent users
- Infrastructure costs remain <200€/month
- APIs response time <500ms
- System uptime >99.5%