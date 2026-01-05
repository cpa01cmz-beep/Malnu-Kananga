import React, { useState } from 'react';
import { NotificationBatch, PushNotification } from '../types';
import { CloseIcon } from './icons/CloseIcon';

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

  const getStatusColor = (status: NotificationBatch['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Manajemen Batch</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Buat Batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada batch notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{batch.name}</h4>
                  <p className="text-sm text-gray-600">
                    {batch.notifications.length} notifikasi
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                  {batch.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
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
                  <button
                    onClick={() => handleSendBatch(batch.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Kirim Sekarang
                  </button>
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Buat Batch Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Batch
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Pengumuman Libur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konten Notifikasi (contoh)
                </label>
                <textarea
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Isi pesan notifikasi..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateBatch}
                  disabled={!batchName.trim() || !notificationText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buat Batch
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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

export default BatchManagement;