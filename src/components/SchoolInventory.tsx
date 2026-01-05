
import React, { useState, useEffect, useCallback } from 'react';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { inventoryAPI } from '../services/apiService';
import type { InventoryItem } from '../types';

interface SchoolInventoryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const SchoolInventory: React.FC<SchoolInventoryProps> = ({ onBack, onShowToast }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
      itemName: '', category: 'Umum', quantity: 1, condition: 'Baik', location: ''
  });

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await inventoryAPI.getAll();
      if (response.success && response.data) {
        setItems(response.data);
      }
    } catch {
      onShowToast('Gagal memuat inventaris', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAddItem = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItem.itemName) return;

      try {
        const response = await inventoryAPI.create({
          itemName: newItem.itemName!,
          category: newItem.category!,
          quantity: Number(newItem.quantity),
          condition: newItem.condition as 'Baik' | 'Rusak Ringan' | 'Rusak Berat',
          location: newItem.location || '-'
        });

        if (response.success && response.data) {
          setItems([...items, response.data]);
          setNewItem({ itemName: '', category: 'Umum', quantity: 1, condition: 'Baik', location: '' });
          onShowToast('Barang berhasil ditambahkan ke inventaris.', 'success');
        } else {
          throw new Error(response.error || 'Gagal menambahkan barang');
        }
      } catch {
        onShowToast('Gagal menambahkan barang. Silakan coba lagi.', 'error');
      }
  };

  const handleDelete = async (id: string) => {
      if(!window.confirm('Hapus barang ini dari daftar?')) return;

      try {
        const response = await inventoryAPI.delete(id);
        if (response.success) {
          setItems(items.filter(i => i.id !== id));
          onShowToast('Barang dihapus.', 'info');
        } else {
          throw new Error(response.error || 'Gagal menghapus barang');
        }
      } catch {
        onShowToast('Gagal menghapus barang. Silakan coba lagi.', 'error');
      }
  };

  return (
    <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Inventaris (Sarpras)</h2>
                <p className="text-gray-500 dark:text-gray-400">Kelola data aset dan barang milik sekolah.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Catat Barang Baru</h3>
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Barang</label>
                            <input required type="text" value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500">
                                    <option>Elektronik</option>
                                    <option>Furniture</option>
                                    <option>Alat Lab</option>
                                    <option>Buku</option>
                                    <option>Umum</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah</label>
                                <input required type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kondisi</label>
                            <select value={newItem.condition} onChange={e => setNewItem({...newItem, condition: e.target.value as 'Baik' | 'Rusak Ringan' | 'Rusak Berat'})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500">
                                <option>Baik</option>
                                <option>Rusak Ringan</option>
                                <option>Rusak Berat</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Penyimpanan</label>
                            <input type="text" value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            <PlusIcon className="w-5 h-5" /> Tambah Barang
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white">Daftar Aset ({items.length})</h3>
                        <ArchiveBoxIcon className="text-gray-400" />
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Memuat data inventaris...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Barang</th>
                                        <th className="px-4 py-3">Jml</th>
                                        <th className="px-4 py-3">Kondisi</th>
                                        <th className="px-6 py-3">Lokasi</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                                {item.itemName}
                                                <div className="text-xs text-gray-500 font-normal">{item.category}</div>
                                            </td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                                    item.condition === 'Baik' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    item.condition === 'Rusak Ringan' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                    {item.condition}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">{item.location}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors">
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SchoolInventory;
