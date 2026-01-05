// Autonomous Agent Configuration
// Team Coordination Protocol Implementation

export interface AgentRole {
  id: string;
  name: string;
  responsibilities: string[];
  capabilities: string[];
  escalationLevel: number;
}

export interface IssueClassification {
  type: string;
  agent: string;
  triggers: string[];
  action: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sla: {
    response: string;
    resolution: string;
  };
}

export interface PerformanceMetrics {
  agent: string;
  metrics: {
    [key: string]: number | string;
  };
  targets: {
    [key: string]: number | string;
  };
}

// Agent Role Definitions
export const AGENT_ROLES: AgentRole[] = [
  {
    id: 'kepala-sekolah',
    name: 'Strategic Coordinator',
    responsibilities: [
      'Strategic decision making',
      'Resource allocation',
      'Repository governance',
      'Risk assessment',
      'Quality enforcement'
    ],
    capabilities: [
      'issue_classification',
      'priority_assessment',
      'resource_optimization',
      'stakeholder_communication'
    ],
    escalationLevel: 3
  },
  {
    id: 'technical-lead',
    name: 'Development Coordinator',
    responsibilities: [
      'Code architecture decisions',
      'Technical debt management',
      'Development workflow optimization',
      'Performance implementation',
      'Code review automation'
    ],
    capabilities: [
      'code_analysis',
      'architecture_review',
      'technical_assessment',
      'quality_gates'
    ],
    escalationLevel: 2
  },
  {
    id: 'devops-engineer',
    name: 'Infrastructure Coordinator',
    responsibilities: [
      'Infrastructure management',
      'Deployment automation',
      'Monitoring and alerting',
      'Security hardening',
      'Backup and recovery'
    ],
    capabilities: [
      'infrastructure_management',
      'deployment_orchestration',
      'monitoring_setup',
      'security_scanning'
    ],
    escalationLevel: 1
  },
  {
    id: 'qa-specialist',
    name: 'Quality Coordinator',
    responsibilities: [
      'Test strategy development',
      'Quality gate enforcement',
      'Performance testing',
      'Bug triage',
      'User experience validation'
    ],
    capabilities: [
      'test_automation',
      'quality_metrics',
      'bug_analysis',
      'performance_testing'
    ],
    escalationLevel: 1
  }
];

// Issue Classification Rules
export const ISSUE_CLASSIFICATION: IssueClassification[] = [
  {
    type: 'KEPSEK_STRATEGIC',
    agent: 'kepala-sekolah',
    triggers: ['roadmap', 'strategy', 'policy', 'governance', 'architecture'],
    action: 'strategic_assessment',
    priority: 'HIGH',
    sla: { response: '4 hours', resolution: '24 hours' }
  },
  {
    type: 'KEPSEK_OPERATIONAL',
    agent: 'kepala-sekolah',
    triggers: ['protocol', 'coordination', 'process', 'workflow'],
    action: 'process_optimization',
    priority: 'MEDIUM',
    sla: { response: '24 hours', resolution: '72 hours' }
  },
  {
    type: 'KEPSEK_URGENT',
    agent: 'kepala-sekolah',
    triggers: ['production', 'critical', 'security', 'downtime'],
    action: 'emergency_response',
    priority: 'CRITICAL',
    sla: { response: '1 hour', resolution: '4 hours' }
  },
  {
    type: 'OPERATOR_MAINTENANCE',
    agent: 'technical-lead',
    triggers: ['bug', 'error', 'fix', 'maintenance', 'update'],
    action: 'technical_assessment',
    priority: 'MEDIUM',
    sla: { response: '24 hours', resolution: '72 hours' }
  },
  {
    type: 'INFRASTRUCTURE',
    agent: 'devops-engineer',
    triggers: ['deployment', 'ci', 'monitoring', 'infrastructure'],
    action: 'infrastructure_review',
    priority: 'HIGH',
    sla: { response: '4 hours', resolution: '24 hours' }
  },
  {
    type: 'QUALITY',
    agent: 'qa-specialist',
    triggers: ['test', 'quality', 'performance', 'accessibility'],
    action: 'quality_assessment',
    priority: 'MEDIUM',
    sla: { response: '24 hours', resolution: '72 hours' }
  }
];

// Performance Metrics Configuration
export const PERFORMANCE_METRICS: PerformanceMetrics[] = [
  {
    agent: 'kepala-sekolah',
    metrics: {
      strategic_decisions_made: 0,
      risk_mitigations: 0,
      stakeholder_satisfaction: 0,
      issues_resolved: 0
    },
    targets: {
      strategic_decisions_made: 5,
      risk_mitigations: 3,
      stakeholder_satisfaction: 4.0,
      issues_resolved: 10
    }
  },
  {
    agent: 'technical-lead',
    metrics: {
      code_quality_score: 0,
      architecture_decisions: 0,
      technical_debt_reduction: 0,
      bugs_fixed: 0
    },
    targets: {
      code_quality_score: 8.0,
      architecture_decisions: 3,
      technical_debt_reduction: 10,
      bugs_fixed: 15
    }
  },
  {
    agent: 'devops-engineer',
    metrics: {
      deployment_success_rate: 0,
      uptime_percentage: 0,
      infrastructure_optimizations: 0,
      security_vulnerabilities_fixed: 0
    },
    targets: {
      deployment_success_rate: 95,
      uptime_percentage: 99.5,
      infrastructure_optimizations: 2,
      security_vulnerabilities_fixed: 5
    }
  },
  {
    agent: 'qa-specialist',
    metrics: {
      test_coverage: 0,
      bugs_caught: 0,
      quality_metrics_score: 0,
      test_automation_rate: 0
    },
    targets: {
      test_coverage: 80,
      bugs_caught: 20,
      quality_metrics_score: 8.0,
      test_automation_rate: 90
    }
  }
];

// Merge Decision Rules
export const MERGE_CONDITIONS = {
  required: {
    no_conflicts: true,
    ci_passes: true,
    tests_pass: true,
    build_success: true,
    security_scan: 'no_high_vulnerabilities'
  },
  automated_checks: {
    code_quality_min: 8.0,
    test_coverage_min: 80,
    performance_impact_max: 5
  },
  escalation_triggers: {
    security_vulnerability: 'immediate_block',
    test_failures: 'requires_human_review',
    build_timeout: 'investigate_infrastructure',
    merge_conflicts: 'auto_resolve_if_trivial'
  }
};

// Communication Schedule
export const COMMUNICATION_SCHEDULE = {
  daily_standup: {
    time: '09:00 WIB',
    duration: '15 minutes',
    participants: ['kepala-sekolah', 'technical-lead', 'devops-engineer', 'qa-specialist']
  },
  weekly_strategic: {
    time: 'Friday 14:00 WIB',
    duration: '60 minutes',
    participants: ['kepala-sekolah', 'technical-lead', 'devops-engineer']
  },
  bi_weekly_technical: {
    time: 'Wednesday 10:00 WIB',
    duration: '45 minutes',
    participants: ['technical-lead', 'devops-engineer', 'qa-specialist']
  }
};

// Helper Functions
export function classifyIssue(title: string, body: string): IssueClassification | null {
  const content = `${title} ${body}`.toLowerCase();
  
  for (const classification of ISSUE_CLASSIFICATION) {
    if (classification.triggers.some(trigger => content.includes(trigger))) {
      return classification;
    }
  }
  
  return null;
}

export function getAgentById(id: string): AgentRole | null {
  return AGENT_ROLES.find(agent => agent.id === id) || null;
}

export function getPriorityScore(priority: string): number {
  const scores = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
  return scores[priority as keyof typeof scores] || 0;
}

export function shouldEscalate(issue: IssueClassification, resolutionTime: number): boolean {
  const slaHours = parseSlaToHours(issue.sla.resolution);
  return resolutionTime > slaHours;
}

function parseSlaToHours(sla: string): number {
  const match = sla.match(/(\d+)\s*(hour|hours|day|days|week|weeks)/);
  if (!match) return 24;
  
  const [, amount, unit] = match;
  const hours = parseInt(amount);
  
  switch (unit) {
    case 'hour':
    case 'hours':
      return hours;
    case 'day':
    case 'days':
      return hours * 24;
    case 'week':
    case 'weeks':
      return hours * 24 * 7;
    default:
      return 24;
  }
}