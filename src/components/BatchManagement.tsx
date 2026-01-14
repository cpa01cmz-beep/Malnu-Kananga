import React from 'react'

import { useState } from 'react';
import { NotificationBatch, PushNotification } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import { EmptyState } from './ui/LoadingState';

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
  const [sendingBatchId, setSendingBatchId] = useState<string | null>(null);

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
    setSendingBatchId(batchId);
    try {
      const success = await sendBatch(batchId);
      if (onShowToast) {
        if (success) {
          onShowToast('Batch berhasil dikirim', 'success');
        } else {
          onShowToast('Gagal mengirim batch', 'error');
        }
      }
    } finally {
      setSendingBatchId(null);
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
        <EmptyState message="Belum ada batch notifikasi" size="md" />
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
                    isLoading={sendingBatchId === batch.id}
                  >
                    Kirim Sekarang
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Buat Batch Baru"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nama Batch"
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Contoh: Pengumuman Libur"
            size="sm"
          />

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
              fullWidth
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
      </Modal>
    </div>
  );
};

export default BatchManagement;