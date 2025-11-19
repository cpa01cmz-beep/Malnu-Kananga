# GitHub Workflows - Repository Automation

This directory contains comprehensive automation workflows for the Malnu-Kananga educational repository. Each workflow is designed using the OpenCode template with specialized AI agents for different roles and responsibilities.

## 🏗️ Core Repository Workflows

### 📋 Issue Solver (`issue-solver.yml`)
**Triggers:** Issues opened/labeled/reopened, every 6 hours, manual dispatch
**Purpose:** Automated issue analysis, troubleshooting, and resolution
**Agent Role:** Expert GitHub issue management and bug fixing

### 🔀 PR Handler (`pr-handler.yml`)
**Triggers:** PR activities, every 4 hours, manual dispatch
**Purpose:** Comprehensive code review, quality assurance, and merge coordination
**Agent Role:** Senior code reviewer and quality gatekeeper

### 🗄️ Repository Manager (`repository-manager.yml`)
**Triggers:** Daily and every 12 hours, main branch changes, manual dispatch
**Purpose:** Repository health monitoring, maintenance, and strategic management
**Agent Role:** DevOps and repository operations lead

## 👥 School Role-Based Workflows

### 🎓 Kepala Sekolah (`kepsek.yml`)
**Triggers:** Weekly and daily schedules, issues/PR activities
**Purpose:** Strategic leadership, decision making, and institutional management
**Agent Role:** Educational institution leader and strategist

### 👨‍🏫 Guru (`guru.yml`)
**Triggers:** Weekdays morning and afternoon, content-related activities
**Purpose:** Educational content development, teaching, and student assessment
**Agent Role:** Digital educator and curriculum developer

### 🔧 Operator (`operator.yml`)
**Triggers:** Multiple daily schedules, every 30 minutes for monitoring
**Purpose:** System operations, monitoring, and technical support
**Agent Role:** System administrator and operations specialist

## 🛡️ Specialized Technical Workflows

### 🔒 Security Analyst (`security-analyst.yml`)
**Triggers:** Daily and every 6 hours, code changes, PR activities
**Purpose:** Security monitoring, vulnerability assessment, and threat protection
**Agent Role:** Cybersecurity expert and incident responder

### ✅ Quality Assurance (`quality-assurance.yml`)
**Triggers:** Daily and every 8 hours, code changes, PR activities
**Purpose:** Testing, quality control, and release validation
**Agent Role:** QA engineer and testing coordinator

### 📚 Documentation Manager (`documentation-manager.yml`)
**Triggers:** Daily and every 12 hours, documentation changes
**Purpose:** Technical writing, documentation maintenance, and knowledge management
**Agent Role:** Technical writer and documentation specialist

### 🎓 Student Support (`student-support.yml`)
**Triggers:** Weekdays schedules, every 15 minutes for urgent support
**Purpose:** Student assistance, academic support, and technical help
**Agent Role:** Student support specialist and academic advisor

## 🚀 Workflow Features

### Common Characteristics
- **AI-Powered:** All workflows use OpenCode CLI with GLM-4.6 model
- **Indonesian Language:** Prompts and responses in Bahasa Indonesia
- **Comprehensive Prompts:** Each agent has detailed role definitions, capabilities, responsibilities, workflows, and limitations
- **Automated Scheduling:** Different frequencies based on role requirements
- **Event-Driven:** Responsive to repository activities (issues, PRs, pushes)
- **Manual Control:** All workflows support manual dispatch for on-demand execution

### Security & Permissions
- **Granular Permissions:** Each workflow has appropriate GitHub permissions
- **Security Focus:** Security workflows have additional security-events permissions
- **Safe Operations:** All agents include clear limitations and safety constraints

### Performance & Reliability
- **Optimized Runtimes:** 20-60 minute timeouts based on complexity
- **Concurrency Control:** Global concurrency groups to prevent conflicts
- **Error Handling:** Comprehensive error handling and recovery procedures
- **Resource Management:** Efficient use of GitHub Actions resources

## 📅 Scheduling Summary

| Frequency | Workflows |
|-----------|-----------|
| Every 15 minutes | Student Support (urgent) |
| Every 30 minutes | Operator (monitoring) |
| Every 4 hours | PR Handler |
| Every 6 hours | Issue Solver, Security Analyst |
| Every 8 hours | Quality Assurance |
| Every 12 hours | Repository Manager, Documentation Manager |
| Daily (specific times) | Security Analyst, Quality Assurance, Documentation Manager |
| Weekdays only | Guru, Student Support |
| Weekly | Kepala Sekolah |

## 🔧 Configuration

### Environment Variables
- `GH_TOKEN`: GitHub token for API access
- `IFLOW_API_KEY`: OpenCode API key for AI agent execution

### Required Secrets
- `IFLOW_API_KEY`: Must be configured in repository secrets

### Dependencies
- OpenCode CLI (installed automatically)
- Ubuntu 24.04-arm runner environment
- GitHub Actions checkout@v5

## 📋 Usage Guidelines

1. **Manual Execution:** Any workflow can be triggered manually via GitHub Actions UI
2. **Monitoring:** Check workflow runs in Actions tab for execution status
3. **Logs:** Detailed execution logs available in each workflow run
4. **Customization:** Modify schedules and triggers in workflow YAML files
5. **Updates:** Agent prompts can be updated by modifying the PROMPT section in each workflow

## 🛠️ Maintenance

- **Regular Updates:** Review and update agent prompts periodically
- **Performance Monitoring:** Monitor workflow execution times and success rates
- **Security Reviews:** Regular security audits of workflow permissions
- **Documentation Updates:** Keep this README updated with workflow changes

## 📞 Support

For issues or questions about these workflows:
1. Check workflow execution logs
2. Review agent prompts for specific role definitions
3. Verify secret configuration (IFLOW_API_KEY)
4. Create an issue in the repository for assistance

---

*Last Updated: November 2025*
*Version: 1.0*
*Framework: OpenCode AI Agents*
