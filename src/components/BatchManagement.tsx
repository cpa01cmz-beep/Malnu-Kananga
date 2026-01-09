import React, { useState } from 'react';
import { NotificationBatch, PushNotification } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import Badge from './ui/Badge';

interface BatchManagementProps {
  batches: NotificationBatch[];
  createBatch: (name: string, notifications: PushNotification[]) => NotificationBatch;
  sendBatch: (batchId: string) => Promise<boolean>;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const BatchManagement: React.FC<BatchManagementProps> = ({
  batches,
  createBatch,
  sendBatch,
  onShowToast,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [notificationText, setNotificationText] = useState('');

  const handleCreateBatch = () => {
    if (!batchName.trim() || !notificationText.trim()) return;

    const sampleNotification: PushNotification = {
      id: 'sample-' + Date.now(),
      type: 'announcement',
      title: batchName,
      body: notificationText,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
    };

    createBatch(batchName, [sampleNotification]);
    setBatchName('');
    setNotificationText('');
    setShowCreateModal(false);

    if (onShowToast) {
      onShowToast('Batch berhasil dibuat', 'success');
    }
  };

  const handleSendBatch = async (batchId: string) => {
    const success = await sendBatch(batchId);
    if (onShowToast) {
      if (success) {
        onShowToast('Batch berhasil dikirim', 'success');
      } else {
        onShowToast('Gagal mengirim batch', 'error');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-900">Manajemen Batch</h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
        >
          Buat Batch
        </Button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <p>Belum ada batch notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-neutral-900">{batch.name}</h4>
                  <p className="text-sm text-neutral-600">
                    {batch.notifications.length} notifikasi
                  </p>
                </div>
                <Badge variant="info" size="sm">
                  {batch.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center text-sm text-neutral-500 mb-3">
                <span>Dibuat: {new Date(batch.createdAt).toLocaleString('id-ID')}</span>
                {batch.sentAt && (
                  <span>Dikirim: {new Date(batch.sentAt).toLocaleString('id-ID')}</span>
                )}
              </div>

              {batch.failureReason && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                  <p className="text-sm text-red-600">{batch.failureReason}</p>
                </div>
              )}

              <div className="flex gap-2">
                {batch.status === 'pending' && (
                  <Button
                    onClick={() => handleSendBatch(batch.id)}
                    size="sm"
                    variant="success"
                  >
                    Kirim Sekarang
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50%"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Buat Batch Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
                aria-label="Tutup"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

              <div className="space-y-4">
              <div>
                <label htmlFor="batch-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nama Batch
                </label>
                <input
                  id="batch-name"
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Pengumuman Libur"
                />
              </div>

              <Textarea
                label="Konten Notifikasi (contoh)"
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                size="md"
                placeholder="Isi pesan notifikasi..."
                minRows={3}
                maxRows={5}
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateBatch}
                  disabled={!batchName.trim() || !notificationText.trim()}
                  className="flex-1"
                >
                  Buat Batch
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
    </div>
  );
};

export default BatchManagement;