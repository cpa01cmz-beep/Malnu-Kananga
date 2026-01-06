import React, { useState, useEffect, useCallback } from 'react';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { BarChart } from 'recharts/es6/chart/BarChart';
import { Bar } from 'recharts/es6/cartesian/Bar';
import { XAxis } from 'recharts/es6/cartesian/XAxis';
import { YAxis } from 'recharts/es6/cartesian/YAxis';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/es6/component/Tooltip';
import { Legend } from 'recharts/es6/component/Legend';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer';
import { PieChart } from 'recharts/es6/chart/PieChart';
import { Pie } from 'recharts/es6/polar/Pie';
import { Cell } from 'recharts/es6/component/Cell';
import { Area } from 'recharts/es6/cartesian/Area';
import { AreaChart } from 'recharts/es6/chart/AreaChart';
import QRCode from 'qrcode';
import { inventoryAPI } from '../services/apiService';
import type { 
  InventoryItem, 
  MaintenanceSchedule, 
  InventoryAudit, 
  InventoryReport,
  CategoryReport,
  ConditionReport,
  DepreciationReport
} from '../types';

interface SchoolInventoryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const COLORS = ['#16a34a', '#2563eb', '#eab308', '#dc2626', '#7c3aed', '#db2777'];

const SchoolInventory: React.FC<SchoolInventoryProps> = ({ onBack, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'maintenance' | 'audit' | 'reports'>('items');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [auditMode, setAuditMode] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<InventoryAudit | null>(null);

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    itemName: '',
    category: 'Umum',
    quantity: 1,
    condition: 'Baik',
    location: '',
    purchaseDate: '',
    purchasePrice: 0,
    depreciationRate: 10,
    status: 'active'
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceSchedule>>({
    type: 'routine',
    status: 'scheduled',
    scheduledDate: '',
    description: ''
  });

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await inventoryAPI.getAll();
      if (response.success && response.data) {
        const itemsWithValue = response.data.map(item => ({
          ...item,
          currentValue: calculateDepreciation(item)
        }));
        setItems(itemsWithValue);
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

  const calculateDepreciation = (item: InventoryItem): number => {
    if (!item.purchasePrice || !item.purchaseDate) return 0;
    const purchaseDate = new Date(item.purchaseDate);
    const today = new Date();
    const yearsDiff = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const rate = (item.depreciationRate || 10) / 100;
    const currentValue = item.purchasePrice * Math.pow(1 - rate, yearsDiff);
    return Math.max(0, Math.round(currentValue * 100) / 100);
  };

  const generateQRCode = async (item: InventoryItem) => {
    try {
      const qrData = JSON.stringify({
        id: item.id,
        name: item.itemName,
        category: item.category,
        location: item.location
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      setShowQRCode(qrCodeUrl);
    } catch {
      onShowToast('Gagal generate QR code', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.itemName) return;

    try {
      const itemData = {
        ...newItem,
        purchasePrice: Number(newItem.purchasePrice),
        depreciationRate: Number(newItem.depreciationRate),
        currentValue: calculateDepreciation(newItem as InventoryItem)
      };

      const response = await inventoryAPI.create(itemData);
      if (response.success && response.data) {
        setItems([...items, response.data]);
        setNewItem({ 
          itemName: '', 
          category: 'Umum', 
          quantity: 1, 
          condition: 'Baik', 
          location: '',
          purchaseDate: '',
          purchasePrice: 0,
          depreciationRate: 10,
          status: 'active'
        });
        setShowAddForm(false);
        onShowToast('Barang berhasil ditambahkan ke inventaris.', 'success');
      }
    } catch {
      onShowToast('Gagal menambahkan barang. Silakan coba lagi.', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if(!window.confirm('Hapus barang ini dari daftar?')) return;

    try {
      const response = await inventoryAPI.delete(id);
      if (response.success) {
        setItems(items.filter(i => i.id !== id));
        onShowToast('Barang dihapus.', 'info');
      }
    } catch {
      onShowToast('Gagal menghapus barang. Silakan coba lagi.', 'error');
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintenance.itemId || !newMaintenance.scheduledDate) return;

    try {
      const maintenanceData = {
        ...newMaintenance,
        itemId: newMaintenance.itemId!,
        itemName: items.find(i => i.id === newMaintenance.itemId)?.itemName || ''
      };

      setMaintenanceSchedules([...maintenanceSchedules, maintenanceData as MaintenanceSchedule]);
      setNewMaintenance({
        type: 'routine',
        status: 'scheduled',
        scheduledDate: '',
        description: ''
      });
      onShowToast('Jadwal维护 berhasil ditambahkan.', 'success');
    } catch {
      onShowToast('Gagal menambahkan jadwal维护.', 'error');
    }
  };

  const startAudit = () => {
    const auditData: InventoryAudit = {
      id: Date.now().toString(),
      auditDate: new Date().toISOString().split('T')[0],
      auditor: 'Current User',
      items: items.map(item => ({
        itemId: item.id,
        expectedQuantity: item.quantity,
        actualQuantity: item.quantity,
        condition: 'matched' as const
      })),
      status: 'in-progress',
      totalItems: items.length,
      matchedItems: items.length,
      mismatchedItems: 0,
      missingItems: 0
    };
    setCurrentAudit(auditData);
    setAuditMode(true);
  };

  const completeAudit = () => {
    if (!currentAudit) return;

    const completedAudit = {
      ...currentAudit,
      status: 'completed' as const
    };

    setAudits([...audits, completedAudit]);
    setAuditMode(false);
    setCurrentAudit(null);
    onShowToast('Audit inventaris selesai.', 'success');
  };

  const generateReport = (): InventoryReport => {
    const totalValue = items.reduce((sum, item) => sum + (item.currentValue || 0), 0);
    
    const categoryBreakdown: CategoryReport[] = Object.entries(
      items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (item.currentValue || 0);
        return acc;
      }, {} as Record<string, number>)
    ).map(([category, value]) => ({
      category,
      count: items.filter(i => i.category === category).length,
      value
    }));

    const conditionBreakdown: ConditionReport[] = ['Baik', 'Rusak Ringan', 'Rusak Berat'].map(condition => ({
      condition,
      count: items.filter(i => i.condition === condition).length,
      percentage: items.length > 0 ? (items.filter(i => i.condition === condition).length / items.length) * 100 : 0
    }));

    const depreciationData: DepreciationReport[] = items
      .filter(item => item.purchasePrice && item.currentValue !== undefined)
      .map(item => ({
        itemName: item.itemName,
        purchaseValue: item.purchasePrice!,
        currentValue: item.currentValue!,
        depreciationAmount: item.purchasePrice! - item.currentValue!,
        depreciationPercentage: item.purchasePrice! > 0 ? ((item.purchasePrice! - item.currentValue!) / item.purchasePrice!) * 100 : 0
      }));

    return {
      totalValue,
      totalItems: items.length,
      categoryBreakdown,
      conditionBreakdown,
      depreciationData,
      maintenanceSchedule: maintenanceSchedules
    };
  };

  const exportReport = () => {
    const report = generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    onShowToast('Laporan berhasil diekspor.', 'success');
  };

  const report = generateReport();

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

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'items', label: 'Daftar Barang', icon: ArchiveBoxIcon },
          { id: 'maintenance', label: 'Jadwal维护', icon: CalendarDaysIcon },
          { id: 'audit', label: 'Audit', icon: DocumentTextIcon },
          { id: 'reports', label: 'Laporan', icon: ChartBarIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'items' | 'maintenance' | 'audit' | 'reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Aset ({items.length})</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Tambah Barang
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Catat Barang Baru</h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Barang</label>
                  <input
                    required
                    type="text"
                    value={newItem.itemName}
                    onChange={e => setNewItem({...newItem, itemName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  >
                    <option>Elektronik</option>
                    <option>Furniture</option>
                    <option>Alat Lab</option>
                    <option>Buku</option>
                    <option>Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kondisi</label>
                  <select
                    value={newItem.condition}
                    onChange={e => setNewItem({...newItem, condition: e.target.value as 'Baik' | 'Rusak Ringan' | 'Rusak Berat'})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  >
                    <option>Baik</option>
                    <option>Rusak Ringan</option>
                    <option>Rusak Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={e => setNewItem({...newItem, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Pembelian</label>
                  <input
                    type="date"
                    value={newItem.purchaseDate}
                    onChange={e => setNewItem({...newItem, purchaseDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Pembelian</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.purchasePrice}
                    onChange={e => setNewItem({...newItem, purchasePrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Suku Bunga Depresiasi (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newItem.depreciationRate}
                    onChange={e => setNewItem({...newItem, depreciationRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={newItem.status}
                    onChange={e => setNewItem({...newItem, status: e.target.value as 'active' | 'maintenance' | 'disposed' | 'lost'})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  >
                    <option>active</option>
                    <option>maintenance</option>
                    <option>disposed</option>
                    <option>lost</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Simpan Barang
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                      <th className="px-4 py-3">Nilai Saat Ini</th>
                      <th className="px-4 py-3">Aksi</th>
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
                        <td className="px-4 py-3">Rp {item.currentValue?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => generateQRCode(item)}
                              className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-full transition-colors"
                              title="Generate QR Code"
                            >
                              <ArchiveBoxIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors"
                              title="Hapus"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Jadwal 维护</h3>
            <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Barang</label>
                <select
                  value={newMaintenance.itemId}
                  onChange={e => setNewMaintenance({...newMaintenance, itemId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  required
                >
                  <option value="">Pilih barang...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.itemName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={newMaintenance.scheduledDate}
                  onChange={e => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                <select
                  value={newMaintenance.type}
                  onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value as 'routine' | 'repair' | 'inspection'})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"
                >
                  <option value="routine">Routine</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Jadwal
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white">Jadwal 维护 ({maintenanceSchedules.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Barang</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {maintenanceSchedules.map(schedule => (
                    <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{schedule.itemName}</td>
                      <td className="px-4 py-3">{schedule.scheduledDate}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {schedule.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          schedule.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          schedule.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          schedule.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">{schedule.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {!auditMode ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DocumentTextIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Audit Inventaris</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Lakukan audit untuk memverifikasi kecocokan data inventaris dengan kondisi aktual.
              </p>
              <button
                onClick={startAudit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mx-auto"
              >
                <DocumentTextIcon />
                Mulai Audit Baru
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Audit Sedang Berlangsung</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentAudit?.totalItems}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Barang</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currentAudit?.matchedItems}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Cocok</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{currentAudit?.mismatchedItems}</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Tidak Cocok</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={completeAudit}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Selesaikan Audit
                  </button>
                  <button
                    onClick={() => setAuditMode(false)}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit History */}
          {audits.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white">Riwayat Audit</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-4 py-3">Auditor</th>
                      <th className="px-4 py-3">Total Barang</th>
                      <th className="px-4 py-3">Cocok</th>
                      <th className="px-4 py-3">Tidak Cocok</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {audits.map(audit => (
                      <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-3">{audit.auditDate}</td>
                        <td className="px-4 py-3">{audit.auditor}</td>
                        <td className="px-4 py-3">{audit.totalItems}</td>
                        <td className="px-4 py-3">{audit.matchedItems}</td>
                        <td className="px-4 py-3">{audit.mismatchedItems}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {audit.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Laporan Inventaris</h3>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon />
              Export Laporan
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Nilai Aset</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp {report.totalValue.toLocaleString()}</p>
                </div>
                <ChartBarIcon />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Barang</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.totalItems}</p>
                </div>
                <ArchiveBoxIcon />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jadwal 维护 Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{maintenanceSchedules.length}</p>
                </div>
                <CalendarDaysIcon />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribusi Kategori</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.categoryBreakdown as Array<{category: string; value: number; count: number}>}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {report.categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Nilai']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Condition Breakdown Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Kondisi</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.conditionBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="condition" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} barang`, 'Jumlah']} />
                  <Bar dataKey="count" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Depreciation Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analisis Depresiasi</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={report.depreciationData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString()}`, '']} />
                <Legend />
                <Area type="monotone" dataKey="purchaseValue" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Nilai Pembelian" />
                <Area type="monotone" dataKey="currentValue" stackId="2" stroke="#10b981" fill="#10b981" name="Nilai Saat Ini" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QR Code Barang</h3>
            <div className="bg-white p-4 rounded-lg">
              <img src={showQRCode} alt="QR Code" className="w-full" />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = 'qrcode.png';
                  link.href = showQRCode;
                  link.click();
                  onShowToast('QR Code berhasil diunduh.', 'success');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Unduh
              </button>
              <button
                onClick={() => setShowQRCode(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolInventory;