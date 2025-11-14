# GitHub Workflows Runbook

This document provides a comprehensive guide to all GitHub workflows in this repository, their purposes, trigger conditions, and troubleshooting information.

## Table of Contents
1. [Workflow Overview](#workflow-overview)
2. [Detailed Workflow Descriptions](#detailed-workflow-descriptions)
3. [Troubleshooting Guide](#troubleshooting-guide)
4. [Best Practices](#best-practices)

## Workflow Overview

The repository contains 23 GitHub workflows that handle various aspects of CI/CD, code quality, security, and automation:

1. `architecture-review.yml` - Reviews code architecture and design patterns
2. `code-inspection.yml` - Performs code quality checks and linting
3. `comprehensive-review.yml` - Runs a complete code review process
4. `deploy.yml` - Deploys the application to Cloudflare
5. `gemini.yml` - AI-powered code review and suggestions
6. `iflow-cli.yml` - iFlow CLI tool automation
7. `iflow-docs.yml` - Documentation generation and updates
8. `iflow-intelijen.yml` - Intelligence gathering for repository insights
9. `iflow-issue.yml` - Automated issue processing and labeling
10. `iflow-maintenance.yml` - Repository maintenance tasks
11. `iflow-orchestrator.yml` - Orchestrates iFlow operations
12. `iflow-orchin.yml` - Orchestrates iFlow operations (alternative)
13. `iflow-pr.yml` - Pull request automation and processing
14. `issue-killer.yml` - Automated issue resolution and cleanup
15. `opencode-run.yml` - OpenCode AI execution workflow
16. `opencode.yml` - OpenCode AI integration
17. `performance-review.yml` - Performance analysis and optimization suggestions
18. `pr-review.yml` - Pull request review automation
19. `quality-review.yml` - Code quality assessment
20. `security-review.yml` - Security vulnerability scanning
21. `_reusable/build-test.yml` - Reusable build and test workflow
22. `_reusable/iflow-cli.yml` - Reusable iFlow CLI workflow
23. `_reusable/setup-node.yml` - Reusable Node.js setup workflow

## Detailed Workflow Descriptions

### 1. architecture-review.yml
**Purpose**: Reviews code architecture and design patterns
**Trigger**: Pull requests
**Key Components**:
- Architecture analysis using AI
- Design pattern validation
- Code structure evaluation

### 2. code-inspection.yml
**Purpose**: Performs code quality checks and linting
**Trigger**: Pull requests, pushes to main branch
**Key Components**:
- ESLint for code style checking
- TypeScript compilation validation
- Dependency analysis

### 3. comprehensive-review.yml
**Purpose**: Runs a complete code review process
**Trigger**: Pull requests
**Key Components**:
- Multiple review stages
- Integration with various analysis tools
- Detailed feedback generation

### 4. deploy.yml
**Purpose**: Deploys the application to Cloudflare
**Trigger**: Pushes to main branch, manual trigger
**Key Components**:
- Cloudflare Pages deployment
- Cloudflare Workers deployment
- Deployment status reporting

### 5. gemini.yml
**Purpose**: AI-powered code review and suggestions
**Trigger**: Pull requests
**Key Components**:
- Google Gemini AI integration
- Code suggestion generation
- Performance optimization recommendations

### 6. iflow-cli.yml
**Purpose**: iFlow CLI tool automation
**Trigger**: Manual trigger
**Key Components**:
- iFlow command execution
- Workflow orchestration
- Status reporting

### 7. iflow-docs.yml
**Purpose**: Documentation generation and updates
**Trigger**: Manual trigger
**Key Components**:
- Automated documentation generation
- Content updates
- Publishing workflows

### 8. iflow-intelijen.yml
**Purpose**: Intelligence gathering for repository insights
**Trigger**: Scheduled (daily)
**Key Components**:
- Repository analysis
- Insight generation
- Reporting

### 9. iflow-issue.yml
**Purpose**: Automated issue processing and labeling
**Trigger**: New issues
**Key Components**:
- Issue categorization
- Label assignment
- Response generation

### 10. iflow-maintenance.yml
**Purpose**: Repository maintenance tasks
**Trigger**: Scheduled (weekly)
**Key Components**:
- Dependency updates
- Cleanup operations
- Health checks

### 11. iflow-orchestrator.yml
**Purpose**: Orchestrates iFlow operations
**Trigger**: Manual trigger
**Key Components**:
- Workflow coordination
- Task scheduling
- Status monitoring

### 12. iflow-orchin.yml
**Purpose**: Orchestrates iFlow operations (alternative)
**Trigger**: Manual trigger
**Key Components**:
- Alternative orchestration approach
- Task management
- Progress tracking

### 13. iflow-pr.yml
**Purpose**: Pull request automation and processing
**Trigger**: New pull requests
**Key Components**:
- PR analysis
- Automated feedback
- Merge readiness assessment

### 14. issue-killer.yml
**Purpose**: Automated issue resolution and cleanup
**Trigger**: Scheduled (daily)
**Key Components**:
- Stale issue identification
- Duplicate detection
- Auto-closure workflows

### 15. opencode-run.yml
**Purpose**: OpenCode AI execution workflow
**Trigger**: Manual trigger
**Key Components**:
- AI-assisted development tasks
- Code generation
- Implementation workflows

### 16. opencode.yml
**Purpose**: OpenCode AI integration
**Trigger**: Pull requests
**Key Components**:
- AI code review
- Suggestion implementation
- Quality assurance

### 17. performance-review.yml
**Purpose**: Performance analysis and optimization suggestions
**Trigger**: Pull requests
**Key Components**:
- Performance benchmarking
- Optimization recommendations
- Resource usage analysis

### 18. pr-review.yml
**Purpose**: Pull request review automation
**Trigger**: New pull requests
**Key Components**:
- Code quality assessment
- Style guide compliance
- Review comment generation

### 19. quality-review.yml
**Purpose**: Code quality assessment
**Trigger**: Pull requests
**Key Components**:
- Code coverage analysis
- Test result evaluation
- Quality gate enforcement

### 20. security-review.yml
**Purpose**: Security vulnerability scanning
**Trigger**: Pull requests, scheduled (daily)
**Key Components**:
- Dependency vulnerability scanning
- Code security analysis
- Threat identification

### 21. _reusable/build-test.yml
**Purpose**: Reusable build and test workflow
**Trigger**: Called by other workflows
**Key Components**:
- Node.js setup
- Dependency installation
- Build process
- Test execution

### 22. _reusable/iflow-cli.yml
**Purpose**: Reusable iFlow CLI workflow
**Trigger**: Called by other workflows
**Key Components**:
- iFlow CLI setup
- Command execution
- Result processing

### 23. _reusable/setup-node.yml
**Purpose**: Reusable Node.js setup workflow
**Trigger**: Called by other workflows
**Key Components**:
- Node.js environment setup
- Cache configuration
- Dependency installation

## Troubleshooting Guide

### Common Issues and Solutions

1. **Workflow failing due to missing dependencies**
   - Check `package.json` for correct dependency versions
   - Verify `package-lock.json` is up to date
   - Clear GitHub Actions cache if needed

2. **Deployment failures**
   - Verify Cloudflare credentials in repository secrets
   - Check if Cloudflare project exists and is correctly configured
   - Review deployment logs for specific error messages

3. **Test failures**
   - Run tests locally with `npm test`
   - Check for environment-specific issues
   - Verify test configuration files

4. **Permission errors**
   - Check repository permissions for GitHub Actions
   - Verify workflow file permissions
   - Review organization-level restrictions

### Debugging Tips

1. **Enable verbose logging**
   - Add `ACTIONS_STEP_DEBUG: true` to workflow environment variables
   - Use `echo` statements to output variable values
   - Enable debug logging in application code

2. **Use workflow dispatch**
   - Test workflows manually using the GitHub UI
   - Add `workflow_dispatch` trigger to workflows for testing
   - Use input parameters to customize test runs

3. **Check workflow history**
   - Review previous successful runs for comparison
   - Identify when failures started occurring
   - Look for correlation with code changes

## Best Practices

### Workflow Design

1. **Use reusable workflows**
   - Create shared components for common tasks
   - Reduce duplication across workflows
   - Simplify maintenance

2. **Implement proper error handling**
   - Add meaningful error messages
   - Use appropriate failure conditions
   - Include rollback mechanisms where needed

3. **Optimize for performance**
   - Use caching effectively
   - Minimize workflow execution time
   - Parallelize independent tasks

### Security

1. **Protect sensitive information**
   - Use repository secrets for credentials
   - Avoid hardcoding sensitive values
   - Regularly rotate credentials

2. **Limit permissions**
   - Use least privilege principle
   - Review workflow permissions regularly
   - Remove unnecessary permissions

### Maintenance

1. **Keep workflows up to date**
   - Regularly update action versions
   - Review and update dependencies
   - Remove unused workflows

2. **Monitor workflow performance**
   - Track execution times
   - Identify bottlenecks
   - Optimize slow workflows

3. **Document changes**
   - Update this runbook when workflows change
   - Include change rationale
   - Provide migration guides when needed