# Multi-Agent Code Review Configuration

This configuration sets up a comprehensive multi-agent code review system that includes specialized agents for security, performance, code quality, and architectural consistency.

## Review Agents

### 1. Security Review Agent
- **Focus**: Security vulnerabilities, OWASP Top 10, authentication, authorization
- **Trigger**: Runs on all pull requests and pushes to main/develop branches
- **Workflow**: `.github/workflows/security-review.yml`

### 2. Performance Review Agent
- **Focus**: Performance bottlenecks, bundle size, rendering optimization
- **Trigger**: Runs on all pull requests and pushes to main/develop branches
- **Workflow**: `.github/workflows/performance-review.yml`

### 3. Code Quality Review Agent
- **Focus**: TypeScript best practices, maintainability, readability
- **Trigger**: Runs on all pull requests and pushes to main/develop branches
- **Workflow**: `.github/workflows/quality-review.yml`

### 4. Architectural Consistency Review Agent
- **Focus**: Architecture patterns, design principles, system design
- **Trigger**: Runs on all pull requests and pushes to main/develop branches
- **Workflow**: `.github/workflows/architecture-review.yml`

## Comprehensive Review Workflow

The comprehensive review workflow combines all four specialized agents:
- **Workflow**: `.github/workflows/comprehensive-review.yml`
- **Trigger**: Runs on all pull requests to ensure all aspects are reviewed
- **Process**: Each agent runs in parallel to provide faster feedback

## Integration with Development Workflow

### Pull Request Process
1. When a pull request is opened/updated, all four specialized agents run automatically
2. Each agent provides focused feedback on its specific area
3. The comprehensive review workflow ensures no aspect is missed
4. Review comments are posted directly on the relevant code lines
5. Summary reviews are provided for each agent's focus area

### Manual Triggers
- Security review can be triggered manually with `/security-review`
- Performance review can be triggered manually with `/performance-review`
- Quality review can be triggered manually with `/quality-review`
- Architecture review can be triggered manually with `/architecture-review`

## Configuration

### Environment Variables Required
- `IFLOW_API_KEY`: API key for iFlow CLI
- `GH_TOKEN`: GitHub token for authentication

### Permissions
- `contents: read` - To read repository contents
- `pull-requests: write` - To post comments on pull requests
- `security-events: write` - For security scanning (where applicable)

## Best Practices

1. **Review Feedback**: All agents provide actionable feedback with specific remediation steps
2. **Parallel Execution**: Agents run in parallel to provide faster feedback
3. **Focused Reviews**: Each agent focuses on its specific area of expertise
4. **Consistency**: All agents follow consistent patterns for feedback delivery
5. **Integration**: Agents work together to provide comprehensive coverage

## Maintenance

- Regular review of agent effectiveness and feedback quality
- Updates to security checks as new vulnerabilities emerge
- Performance metrics tracking for review process efficiency
- Periodic updates to align with evolving best practices