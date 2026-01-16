export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  config: ReportConfig;
}

export interface ReportConfig {
  title: string;
  selectedMetrics: string[];
  selectedCharts: ChartConfig[];
  selectedTables: TableConfig[];
  dateRange: {
    startDate: string;
    endDate: string;
    label: string;
  };
  filters: {
    classId?: string;
    subjectId?: string;
    studentId?: string;
    teacherId?: string;
    academicYear?: string;
    semester?: '1' | '2';
  };
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  dataSource: string;
  metric: string;
  showMovingAverage?: boolean;
  showLegend?: boolean;
}

export interface TableConfig {
  title: string;
  dataSource: string;
  columns: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AvailableMetric {
  id: string;
  label: string;
  category: 'overview' | 'performance' | 'attendance' | 'grades';
  type: 'number' | 'percentage' | 'string';
  description?: string;
}

export interface AvailableChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  label: string;
  description?: string;
  dataSources: string[];
  requiredMetrics?: string[];
}

export interface AvailableTable {
  id: string;
  label: string;
  description?: string;
  dataSource: string;
  columns: { key: string; label: string }[];
}

export interface ReportPreviewData {
  metrics: Record<string, number | string>;
  charts: Array<{
    id: string;
    type: string;
    title: string;
    data: unknown;
  }>;
  tables: Array<{
    id: string;
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}

export interface CustomReportBuilderState {
  config: ReportConfig;
  selectedTemplate?: ReportTemplate;
  preview: ReportPreviewData | null;
  isPreviewLoading: boolean;
  savedTemplates: ReportTemplate[];
}
