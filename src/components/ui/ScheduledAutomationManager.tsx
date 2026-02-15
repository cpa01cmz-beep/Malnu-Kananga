import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Badge from './Badge';
import Card from './Card';
import { Table, Thead, Tbody, Tr, Th, Td } from './Table';
import { Toggle } from './Toggle';
import Heading from './Heading';
import Alert from './Alert';
import { 
  scheduledAutomationService, 
  ScheduledTask, 
  ScheduledTaskType,
  ScheduledAutomationSettings 
} from '../../services/scheduledAutomationService';

interface ScheduledAutomationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TASK_TYPE_LABELS: Record<ScheduledTaskType, string> = {
  backup: 'Cadangan Data',
  attendance_notification: 'Notifikasi Absensi',
  grade_reminder: 'Pengingat Nilai',
  academic_calendar: 'Kalender Akademik',
  custom: 'Tugas Khusus'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'neutral',
  running: 'blue',
  completed: 'green',
  failed: 'red',
  cancelled: 'neutral'
};

export const ScheduledAutomationManager: React.FC<ScheduledAutomationManagerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [settings, setSettings] = useState<ScheduledAutomationSettings>(
    scheduledAutomationService.getSettings()
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'backup' as ScheduledTaskType,
    name: '',
    description: '',
    cronExpression: '',
    enabled: true,
    intervalMs: 3600000
  });

  useEffect(() => {
    if (isOpen) {
      setTasks(scheduledAutomationService.getAllTasks());
      setSettings(scheduledAutomationService.getSettings());
    }
  }, [isOpen]);

  const handleCreateTask = () => {
    const newTask = scheduledAutomationService.createTask({
      type: formData.type,
      name: formData.name,
      description: formData.description,
      cronExpression: formData.cronExpression || undefined,
      intervalMs: formData.intervalMs,
      enabled: formData.enabled,
      config: {}
    });
    setTasks([...tasks, newTask]);
    setIsCreating(false);
    setFormData({
      type: 'backup',
      name: '',
      description: '',
      cronExpression: '',
      enabled: true,
      intervalMs: 3600000
    });
  };

  const handleToggleTask = (taskId: string, enabled: boolean) => {
    scheduledAutomationService.updateTask(taskId, { enabled });
    setTasks(scheduledAutomationService.getAllTasks());
  };

  const handleDeleteTask = (taskId: string) => {
    scheduledAutomationService.deleteTask(taskId);
    setTasks(scheduledAutomationService.getAllTasks());
  };

  const handleUpdateSettings = (newSettings: Partial<ScheduledAutomationSettings>) => {
    scheduledAutomationService.updateSettings(newSettings);
    setSettings(scheduledAutomationService.getSettings());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manajer Otomatisasi Terjadwal"
      size="lg"
    >
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">
                Sistem Otomatisasi
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Aktifkan atau nonaktifkan sistem penjadwalan otomatis
              </p>
            </div>
            <Toggle
              checked={settings.enabled}
              onChange={() => handleUpdateSettings({ enabled: !settings.enabled })}
            />
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Heading level={4}>Daftar Tugas Terjadwal</Heading>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={!settings.enabled}
            shortcut="Ctrl+N"
          >
            + Tambah Tugas
          </Button>
        </div>

        {tasks.length === 0 ? (
          <Alert variant="info">
            Belum ada tugas terjadwal. Klik "Tambah Tugas" untuk membuat tugas baru.
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Nama</Th>
                  <Th>Jenis</Th>
                  <Th>Status</Th>
                  <Th>Terakhir</Th>
                  <Th>Aktif</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks.map((task) => (
                  <Tr key={task.id}>
                    <Td>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {task.name}
                        </p>
                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="neutral">
                        {TASK_TYPE_LABELS[task.type]}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant={STATUS_COLORS[task.status] as 'neutral' | 'blue' | 'green' | 'red'}>
                        {task.status}
                      </Badge>
                    </Td>
                    <Td className="text-sm text-neutral-600 dark:text-neutral-400">
                      {task.lastRun 
                        ? new Date(task.lastRun).toLocaleString('id-ID')
                        : '-'}
                    </Td>
                    <Td>
                      <Toggle
                        checked={task.enabled}
                        onChange={() => handleToggleTask(task.id, !task.enabled)}
                        disabled={!settings.enabled}
                      />
                    </Td>
                    <Td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}

        {isCreating && (
          <Card className="p-4 mt-4">
            <Heading level={5} className="mb-4">Buat Tugas Baru</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Tugas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Backup Harian"
                required
              />
              <Select
                label="Jenis Tugas"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ScheduledTaskType })}
                options={Object.entries(TASK_TYPE_LABELS).map(([value, label]) => ({
                  value,
                  label
                }))}
              />
              <Input
                label="Jadwal (Cron)"
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                placeholder="0 0 * * *"
              />
              <Input
                label="Interval (jam)"
                type="number"
                value={(formData.intervalMs / 3600000).toString()}
                onChange={(e) => setFormData({ ...formData, intervalMs: parseInt(e.target.value) * 3600000 })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Deskripsi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi opsional..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="secondary" onClick={() => setIsCreating(false)} shortcut="Esc">
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTask}
                disabled={!formData.name}
                shortcut="Ctrl+S"
              >
                Simpan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ScheduledAutomationManager;
