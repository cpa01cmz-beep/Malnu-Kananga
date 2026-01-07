import React, { useState } from 'react';
import { NotificationTemplate, PushNotification } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface TemplateManagementProps {
  templates: NotificationTemplate[];
  createTemplate: (name: string, type: PushNotification['type'], title: string, body: string, variables?: string[]) => NotificationTemplate;
  createNotificationFromTemplate: (templateId: string, variables?: Record<string, string | number>) => PushNotification | null;
  showNotification: (notification: PushNotification) => Promise<void>;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({
  templates,
  createTemplate,
  createNotificationFromTemplate,
  showNotification,
  onShowToast,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'announcement' as PushNotification['type'],
    title: '',
    body: '',
    variables: '',
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.title.trim() || !newTemplate.body.trim()) return;

    const variables = newTemplate.variables
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    createTemplate(newTemplate.name, newTemplate.type, newTemplate.title, newTemplate.body, variables);
    
    setNewTemplate({
      name: '',
      type: 'announcement',
      title: '',
      body: '',
      variables: '',
    });
    setShowCreateModal(false);

    if (onShowToast) {
      onShowToast('Template berhasil dibuat', 'success');
    }
  };

  const testTemplate = async (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setTestVariables(initialVariables);
    setShowTestModal(true);
  };

  const handleTestNotification = async () => {
    if (!selectedTemplate) return;

    const notification = createNotificationFromTemplate(selectedTemplate.id, testVariables);
    if (notification) {
      await showNotification(notification);
      setShowTestModal(false);
      if (onShowToast) {
        onShowToast('Notifikasi tes berhasil dikirim', 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Gagal membuat notifikasi dari template', 'error');
      }
    }
  };

  const getTypeColor = (type: PushNotification['type']) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'grade': return 'bg-green-100 text-green-800';
      case 'ppdb': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-yellow-100 text-yellow-800';
      case 'library': return 'bg-indigo-100 text-indigo-800';
      case 'system': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-900">Template Notifikasi</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Buat Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <p>Belum ada template notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-neutral-900">{template.name}</h4>
                  <p className="text-sm text-neutral-600">
                    {template.title.substring(0, 50)}{template.title.length > 50 ? '...' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                    {template.type}
                  </span>
                </div>
              </div>

              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.variables.map(variable => (
                    <span key={variable} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-neutral-500 mb-3">
                <span>Dibuat: {new Date(template.createdAt).toLocaleString('id-ID')}</span>
                <span>Diperbarui: {new Date(template.updatedAt).toLocaleString('id-ID')}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => testTemplate(template)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Tes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Buat Template Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Pengumuman Libur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipe Notifikasi
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as PushNotification['type'] })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="announcement">Pengumuman</option>
                  <option value="grade">Nilai</option>
                  <option value="ppdb">PPDB</option>
                  <option value="event">Event</option>
                  <option value="library">Library</option>
                  <option value="system">Sistem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: {{eventType}} akan segera dimulai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Isi Pesan
                </label>
                <textarea
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Contoh: {{eventTitle}} akan dimulai pada {{eventTime}} di {{location}}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Variabel (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={newTemplate.variables}
                  onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: eventType, eventTitle, eventTime, location"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateTemplate}
                  disabled={!newTemplate.name.trim() || !newTemplate.title.trim() || !newTemplate.body.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buat Template
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Template Modal */}
      {showTestModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowTestModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Tes Template</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Template: {selectedTemplate.name}
                </p>
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-900">
                    {selectedTemplate.title.replace(/\{\{(\w+)\}\}/g, '[$1]')}
                  </p>
                  <p className="text-blue-700">
                    {selectedTemplate.body.replace(/\{\{(\w+)\}\}/g, '[$1]')}
                  </p>
                </div>
              </div>

              {selectedTemplate.variables.map(variable => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={testVariables[variable] || ''}
                    onChange={(e) => setTestVariables({ ...testVariables, [variable]: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Nilai untuk {{${variable}}}`}
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <button
                  onClick={handleTestNotification}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Kirim Notifikasi Tes
                </button>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;