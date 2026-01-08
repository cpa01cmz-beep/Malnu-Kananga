import React, { useState } from 'react';
import { NotificationTemplate, PushNotification } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';

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
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
        >
          Buat Template
        </Button>
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
                <Button
                  onClick={() => testTemplate(template)}
                  variant="success"
                  size="sm"
                >
                  Tes
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50%"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Buat Template Baru</h3>
              <IconButton
                onClick={() => setShowCreateModal(false)}
                icon={<CloseIcon className="w-4 h-4" />}
                aria-label="Tutup"
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Nama Template"
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Contoh: Pengumuman Libur"
                size="sm"
              />

              <Select
                label="Tipe Notifikasi"
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as PushNotification['type'] })}
                options={[
                  { value: 'announcement', label: 'Pengumuman' },
                  { value: 'grade', label: 'Nilai' },
                  { value: 'ppdb', label: 'PPDB' },
                  { value: 'event', label: 'Event' },
                  { value: 'library', label: 'Library' },
                  { value: 'system', label: 'Sistem' },
                ]}
                size="sm"
              />

              <Input
                label="Judul"
                type="text"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                placeholder="Contoh: {{eventType}} akan segera dimulai"
                size="sm"
              />

              <Textarea
                label="Isi Pesan"
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                rows={3}
                placeholder="Contoh: {{eventTitle}} akan dimulai pada {{eventTime}} di {{location}}"
                size="sm"
              />

              <Input
                label="Variabel (pisahkan dengan koma)"
                type="text"
                value={newTemplate.variables}
                onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
                placeholder="Contoh: eventType, eventTitle, eventTime, location"
                size="sm"
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateTemplate}
                  disabled={!newTemplate.name.trim() || !newTemplate.title.trim() || !newTemplate.body.trim()}
                  fullWidth
                >
                  Buat Template
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Template Modal */}
      {showTestModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50%"
            onClick={() => setShowTestModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Tes Template</h3>
              <IconButton
                onClick={() => setShowTestModal(false)}
                icon={<CloseIcon className="w-4 h-4" />}
                aria-label="Tutup"
              />
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
                <Input
                  key={variable}
                  label={variable}
                  type="text"
                  value={testVariables[variable] || ''}
                  onChange={(e) => setTestVariables({ ...testVariables, [variable]: e.target.value })}
                  placeholder={`Nilai untuk {{${variable}}}`}
                  size="sm"
                />
              ))}

              <div className="flex gap-3">
                <Button
                  onClick={handleTestNotification}
                  variant="success"
                  fullWidth
                >
                  Kirim Notifikasi Tes
                </Button>
                <Button
                  onClick={() => setShowTestModal(false)}
                  variant="secondary"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;