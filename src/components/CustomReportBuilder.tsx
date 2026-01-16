import { useState, useEffect, useCallback } from 'react';
import {
  DocumentArrowDownIcon,
  PlusIcon,
  TrashIcon,
  BookmarkIcon,
  EyeIcon,
  ChartBarIcon,
  TableCellsIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { analyticsService } from '../services/analyticsService';
import { reportTemplatesService } from '../services/reportTemplatesService';
import { logger } from '../utils/logger';
import type {
  ReportConfig,
  ReportTemplate,
  ReportPreviewData,
  AvailableMetric,
  AvailableChart,
  AvailableTable,
} from '../types/report.types';
import { AVAILABLE_METRICS, AVAILABLE_CHARTS, AVAILABLE_TABLES } from '../constants/reports';
import { DateRangeFilter } from './analytics/DateRangeFilter';
import type { UserRole } from '../types';

interface CustomReportBuilderProps {
  userRole: UserRole;
  userId?: string;
  onShowToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  userRole,
  userId,
  onShowToast,
}) => {
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Custom Report',
    selectedMetrics: [],
    selectedCharts: [],
    selectedTables: [],
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      label: 'Last 30 Days',
    },
    filters: {},
  });
  const [preview, setPreview] = useState<ReportPreviewData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | undefined>();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'metrics' | 'charts' | 'tables'>('metrics');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = useCallback(() => {
    try {
      const templates = reportTemplatesService.getTemplates();
      const userTemplates = templates.filter(t => t.createdBy === userId || userRole === 'admin');
      setSavedTemplates(userTemplates);
    } catch (error) {
      logger.error('Error loading templates:', error);
      onShowToast('Failed to load templates', 'error');
    }
  }, [userId, userRole, onShowToast]);

  const handleConfigChange = <K extends keyof ReportConfig>(key: K, value: ReportConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleMetricToggle = (metricId: string) => {
    const metrics = config.selectedMetrics.includes(metricId)
      ? config.selectedMetrics.filter(m => m !== metricId)
      : [...config.selectedMetrics, metricId];
    setConfig(prev => ({ ...prev, selectedMetrics: metrics }));
  };

  const handleChartToggle = (chart: AvailableChart) => {
    const chartExists = config.selectedCharts.find(c => c.dataSource === chart.id);
    let newCharts: typeof config.selectedCharts;

    if (chartExists) {
      newCharts = config.selectedCharts.filter(c => c.dataSource !== chart.id);
    } else {
      newCharts = [
        ...config.selectedCharts,
        {
          type: chart.type,
          title: chart.label,
          dataSource: chart.id,
          metric: chart.requiredMetrics?.[0] || '',
        },
      ];
    }

    setConfig(prev => ({ ...prev, selectedCharts: newCharts }));
  };

  const handleTableToggle = (table: AvailableTable) => {
    const tableExists = config.selectedTables.find(t => t.dataSource === table.id);
    let newTables: typeof config.selectedTables;

    if (tableExists) {
      newTables = config.selectedTables.filter(t => t.dataSource !== table.id);
    } else {
      newTables = [
        ...config.selectedTables,
        {
          title: table.label,
          dataSource: table.id,
          columns: table.columns.map(c => c.key),
        },
      ];
    }

    setConfig(prev => ({ ...prev, selectedTables: newTables }));
  };

  const handleGeneratePreview = useCallback(async () => {
    if (
      config.selectedMetrics.length === 0 &&
      config.selectedCharts.length === 0 &&
      config.selectedTables.length === 0
    ) {
      onShowToast('Please select at least one metric, chart, or table', 'error');
      return;
    }

    setIsPreviewLoading(true);
    try {
      let analyticsData;
      if (userRole === 'admin') {
        analyticsData = await analyticsService.getSchoolWideAnalytics(config);
      } else if (userRole === 'student' && userId) {
        analyticsData = await analyticsService.getStudentPerformanceAnalytics(userId, config);
      } else if (userRole === 'teacher' && userId) {
        analyticsData = await analyticsService.getTeacherEffectivenessAnalytics(userId, config);
      }

      const previewData: ReportPreviewData = {
        metrics: {},
        charts: [],
        tables: [],
      };

      if (analyticsData) {
        previewData.metrics = {
          title: config.title,
          generatedAt: new Date().toISOString(),
        };
      }

      setPreview(previewData);
      onShowToast('Preview generated successfully', 'success');
    } catch (error) {
      logger.error('Error generating preview:', error);
      onShowToast('Failed to generate preview', 'error');
    } finally {
      setIsPreviewLoading(false);
    }
  }, [config, userRole, userId, onShowToast]);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      onShowToast('Please enter a template name', 'error');
      return;
    }

    try {
      const template = reportTemplatesService.createTemplate(
        templateName,
        templateDescription,
        config,
        userId || 'system',
      );
      setSavedTemplates(prev => [...prev, template]);
      setShowSaveDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      onShowToast('Template saved successfully', 'success');
    } catch (error) {
      logger.error('Error saving template:', error);
      onShowToast('Failed to save template', 'error');
    }
  };

  const handleLoadTemplate = (template: ReportTemplate) => {
    setConfig(template.config);
    setSelectedTemplate(template);
    onShowToast(`Template "${template.name}" loaded`, 'success');
  };

  const handleDeleteTemplate = (templateId: string) => {
    try {
      reportTemplatesService.deleteTemplate(templateId);
      setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(undefined);
      }
      onShowToast('Template deleted', 'success');
    } catch (error) {
      logger.error('Error deleting template:', error);
      onShowToast('Failed to delete template', 'error');
    }
  };

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    try {
      const newTemplate = reportTemplatesService.duplicateTemplate(template, userId || 'system');
      setSavedTemplates(prev => [...prev, newTemplate]);
      onShowToast('Template duplicated', 'success');
    } catch (error) {
      logger.error('Error duplicating template:', error);
      onShowToast('Failed to duplicate template', 'error');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      await analyticsService.exportAnalyticsReport(preview as any, {
        format,
        includeCharts: config.selectedCharts.length > 0,
        includeTables: config.selectedTables.length > 0,
        dateRange: config.dateRange,
        filters: config,
      });
      onShowToast(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      logger.error('Error exporting report:', error);
      onShowToast('Failed to export report', 'error');
    }
  };

  const filteredMetrics = AVAILABLE_METRICS.filter(metric => {
    if (userRole === 'student') {
      return ['averageGPA', 'attendanceRate', 'improvementRate'].includes(metric.id);
    }
    return true;
  });

  const filteredCharts = AVAILABLE_CHARTS.filter(chart => {
    if (userRole === 'student') {
      return chart.dataSources.includes('studentPerformance');
    }
    return true;
  });

  return (
    <div className="custom-report-builder">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Custom Report Builder
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Create and customize your own analytics reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Save template"
          >
            <BookmarkIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Save Template</span>
          </button>
          <button
            onClick={handleGeneratePreview}
            disabled={isPreviewLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Generate preview"
          >
            {isPreviewLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Report Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="report-title"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Report Title
                </label>
                <input
                  id="report-title"
                  type="text"
                  value={config.title}
                  onChange={e => handleConfigChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="Enter report title"
                  aria-label="Report title"
                />
              </div>
              <DateRangeFilter
                filters={{
                  dateRange: config.dateRange,
                  role: userRole === 'admin' || userRole === 'teacher' || userRole === 'student' ? userRole : undefined,
                  academicYear: new Date().getFullYear().toString(),
                  semester: '1',
                }}
                onFiltersChange={filters => handleConfigChange('dateRange', filters.dateRange)}
                onApplyFilters={() => {}}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Select Content
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'metrics'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                  aria-label="Select metrics"
                >
                  Metrics
                </button>
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'charts'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                  aria-label="Select charts"
                >
                  Charts
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'tables'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                  aria-label="Select tables"
                >
                  Tables
                </button>
              </div>
            </div>

            {activeTab === 'metrics' && (
              <div className="space-y-2">
                {['overview', 'performance', 'attendance', 'grades'].map(category => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredMetrics
                        .filter(m => m.category === category)
                        .map(metric => (
                          <label
                            key={metric.id}
                            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              config.selectedMetrics.includes(metric.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={config.selectedMetrics.includes(metric.id)}
                              onChange={() => handleMetricToggle(metric.id)}
                              className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                              aria-label={`Select ${metric.label}`}
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                {metric.label}
                              </div>
                              {metric.description && (
                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                  {metric.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCharts.map(chart => (
                  <label
                    key={chart.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      config.selectedCharts.find(c => c.dataSource === chart.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={config.selectedCharts.some(c => c.dataSource === chart.id)}
                      onChange={() => handleChartToggle(chart)}
                      className="w-4 h-4 mt-1 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                      aria-label={`Select ${chart.label}`}
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ChartBarIcon className="w-4 h-4 text-blue-600" />
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {chart.label}
                        </div>
                      </div>
                      {chart.description && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          {chart.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded">
                          {chart.type}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'tables' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_TABLES.map(table => (
                  <label
                    key={table.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      config.selectedTables.find(t => t.dataSource === table.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={config.selectedTables.some(t => t.dataSource === table.id)}
                      onChange={() => handleTableToggle(table)}
                      className="w-4 h-4 mt-1 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                      aria-label={`Select ${table.label}`}
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <TableCellsIcon className="w-4 h-4 text-purple-600" />
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {table.label}
                        </div>
                      </div>
                      {table.description && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          {table.description}
                        </div>
                      )}
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {table.columns.length} columns
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Saved Templates
            </h2>
            {savedTemplates.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <PlusIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No saved templates yet</p>
                <p className="text-xs mt-1">Save your configuration to create a template</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {savedTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleLoadTemplate(template)}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                          aria-label={`Load ${template.name}`}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                          aria-label={`Duplicate ${template.name}`}
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          aria-label={`Delete ${template.name}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>
                        {template.config.selectedMetrics.length} metrics
                      </span>
                      <span>
                        {template.config.selectedCharts.length} charts
                      </span>
                      <span>
                        {template.config.selectedTables.length} tables
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Summary
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Selected Metrics:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {config.selectedMetrics.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Selected Charts:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {config.selectedCharts.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Selected Tables:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {config.selectedTables.length}
                </span>
              </div>
              <hr className="border-neutral-200 dark:border-neutral-700" />
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-neutral-600 dark:text-neutral-400">Total Items:</span>
                <span className="text-neutral-900 dark:text-white">
                  {config.selectedMetrics.length + config.selectedCharts.length + config.selectedTables.length}
                </span>
              </div>
            </div>

            {preview && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Export as PDF"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Export as Excel"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-template-title"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 id="save-template-title" className="text-lg font-semibold text-neutral-900 dark:text-white">
                Save as Template
              </h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label="Close dialog"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="template-name"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Template Name
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="Enter template name"
                  aria-label="Template name"
                />
              </div>
              <div>
                <label
                  htmlFor="template-description"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={e => setTemplateDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white resize-none"
                  placeholder="Enter template description"
                  aria-label="Template description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save template"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReportBuilder;
