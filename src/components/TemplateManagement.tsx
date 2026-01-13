import React, { useState } from 'react';
import { NotificationTemplate, PushNotification } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Badge from './ui/Badge';
import Modal from './ui/Modal';

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
  const [isSendingTestNotification, setIsSendingTestNotification] = useState(false);
  
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

    setIsSendingTestNotification(true);
    try {
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
    } finally {
      setIsSendingTestNotification(false);
    }
  };

  const getTypeVariant = (type: PushNotification['type']): 'info' | 'success' | 'purple' | 'warning' | 'indigo' | 'error' | 'neutral' => {
    switch (type) {
      case 'announcement': return 'info';
      case 'grade': return 'success';
      case 'ppdb': return 'purple';
      case 'event': return 'warning';
      case 'library': return 'indigo';
      case 'system': return 'error';
      default: return 'neutral';
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
                  <Badge variant={getTypeVariant(template.type)} size="sm">
                    {template.type}
                  </Badge>
                </div>
              </div>

              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.variables.map(variable => (
                    <Badge key={variable} variant="neutral" size="sm">
                      {`{{${variable}}}`}
                    </Badge>
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Buat Template Baru"
        size="md"
      >
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
      </Modal>

      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Tes Template"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Template: {selectedTemplate?.name}
            </p>
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-900">
                {selectedTemplate?.title.replace(/\{\{(\w+)\}\}/g, '[$1]')}
              </p>
              <p className="text-blue-700">
                {selectedTemplate?.body.replace(/\{\{(\w+)\}\}/g, '[$1]')}
              </p>
            </div>
          </div>

          {selectedTemplate?.variables.map(variable => (
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
              disabled={isSendingTestNotification}
            >
              {isSendingTestNotification ? 'Mengirim...' : 'Kirim Notifikasi Tes'}
            </Button>
            <Button
              onClick={() => setShowTestModal(false)}
              variant="secondary"
            >
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateManagement;