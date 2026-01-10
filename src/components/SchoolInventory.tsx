import React, { useState, useEffect, useCallback } from 'react';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import Button from './ui/Button';
import Badge from './ui/Badge';
import DocumentTextIcon from './icons/DocumentTextIcon';
import Tab from './ui/Tab';
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
import { useCanAccess } from '../hooks/useCanAccess';
import AccessDenied from './AccessDenied';
import { CHART_COLORS } from '../config/chartColors';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './ui/Modal';
import ConfirmationDialog from './ui/ConfirmationDialog';
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

const COLORS = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.yellow,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

const SchoolInventory: React.FC<SchoolInventoryProps> = ({ onBack, onShowToast }) => {
  // ALL hooks first
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

  // Permission check for inventory management - AFTER all hooks
  const { canAccess } = useCanAccess();
  const inventoryAccess = canAccess('inventory.manage');
  
  if (!inventoryAccess.canAccess) {
    return (
      <AccessDenied 
        onBack={onBack} 
        requiredPermission={inventoryAccess.requiredPermission}
        message={inventoryAccess.reason}
      />
    );
  }

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

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await inventoryAPI.delete(itemToDelete);
      if (response.success) {
        setItems(items.filter(i => i.id !== itemToDelete));
        onShowToast('Barang dihapus.', 'info');
      }
    } catch {
      onShowToast('Gagal menghapus barang. Silakan coba lagi.', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
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
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Manajemen Inventaris (Sarpras)</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Kelola data aset dan barang milik sekolah.</p>
        </div>
      </div>

      <Tab
        variant="icon"
        color="green"
        options={[
          { id: 'items', label: 'Daftar Barang', icon: ArchiveBoxIcon },
          { id: 'maintenance', label: 'Jadwal维护', icon: CalendarDaysIcon },
          { id: 'audit', label: 'Audit', icon: DocumentTextIcon },
          { id: 'reports', label: 'Laporan', icon: ChartBarIcon },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as 'maintenance' | 'reports' | 'audit' | 'items')}
        className="mb-6"
      />

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Daftar Aset ({items.length})</h3>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="green-solid"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Tambah Barang
            </Button>
          </div>

          {showAddForm && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Catat Barang Baru</h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Nama Barang"
                  required
                  type="text"
                  value={newItem.itemName}
                  onChange={e => setNewItem({...newItem, itemName: e.target.value})}
                  size="sm"
                  fullWidth
                />
                <Select
                  label="Kategori"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value as string})}
                  options={[
                    { value: 'Elektronik', label: 'Elektronik' },
                    { value: 'Furniture', label: 'Furniture' },
                    { value: 'Alat Lab', label: 'Alat Lab' },
                    { value: 'Buku', label: 'Buku' },
                    { value: 'Umum', label: 'Umum' }
                  ]}
                  size="sm"
                  fullWidth
                />
                <Input
                  label="Jumlah"
                  required
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  size="sm"
                  fullWidth
                />
                <Select
                  label="Kondisi"
                  value={newItem.condition}
                  onChange={e => setNewItem({...newItem, condition: e.target.value as 'Baik' | 'Rusak Ringan' | 'Rusak Berat'})}
                  options={[
                    { value: 'Baik', label: 'Baik' },
                    { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                    { value: 'Rusak Berat', label: 'Rusak Berat' }
                  ]}
                  size="sm"
                  fullWidth
                />
                <Input
                  label="Lokasi"
                  type="text"
                  value={newItem.location}
                  onChange={e => setNewItem({...newItem, location: e.target.value})}
                  size="sm"
                  fullWidth
                />
                <Input
                  label="Tanggal Pembelian"
                  type="date"
                  value={newItem.purchaseDate}
                  onChange={e => setNewItem({...newItem, purchaseDate: e.target.value})}
                  size="sm"
                  fullWidth
                />
                <Input
                  label="Harga Pembelian"
                  type="number"
                  min="0"
                  value={newItem.purchasePrice}
                  onChange={e => setNewItem({...newItem, purchasePrice: Number(e.target.value)})}
                  size="sm"
                  fullWidth
                />
                <Input
                  label="Suku Bunga Depresiasi (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.depreciationRate}
                  onChange={e => setNewItem({...newItem, depreciationRate: Number(e.target.value)})}
                  size="sm"
                  fullWidth
                />
                <Select
                  label="Status"
                  value={newItem.status}
                  onChange={e => setNewItem({...newItem, status: e.target.value as 'active' | 'maintenance' | 'disposed' | 'lost'})}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'disposed', label: 'Disposed' },
                    { value: 'lost', label: 'Lost' }
                  ]}
                  size="sm"
                  fullWidth
                />
                <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                  <Button
                    type="submit"
                    variant="blue-solid"
                    icon={<PlusIcon className="w-5 h-5" />}
                  >
                    Simpan Barang
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-500">Memuat data inventaris...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                  <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Barang</th>
                      <th className="px-4 py-3">Jml</th>
                      <th className="px-4 py-3">Kondisi</th>
                      <th className="px-6 py-3">Lokasi</th>
                      <th className="px-4 py-3">Nilai Saat Ini</th>
                      <th className="px-4 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                        <td className="px-6 py-3 font-medium text-neutral-900 dark:text-white">
                          {item.itemName}
                          <div className="text-xs text-neutral-500 font-normal">{item.category}</div>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={item.condition === 'Baik' ? 'success' : item.condition === 'Rusak Ringan' ? 'warning' : 'error'}
                            size="sm"
                          >
                            {item.condition}
                          </Badge>
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
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Tambah Jadwal 维护</h3>
            <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Pilih Barang"
                value={newMaintenance.itemId}
                onChange={e => setNewMaintenance({...newMaintenance, itemId: e.target.value as string})}
                options={[
                  { value: '', label: 'Pilih barang...', disabled: true },
                  ...items.map(item => ({ value: item.id, label: item.itemName }))
                ]}
                size="sm"
                fullWidth
                required
              />
              <Input
                label="Tanggal"
                type="date"
                value={newMaintenance.scheduledDate}
                onChange={e => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                size="sm"
                fullWidth
                required
              />
              <Select
                label="Tipe"
                value={newMaintenance.type}
                onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value as 'routine' | 'repair' | 'inspection'})}
                options={[
                  { value: 'routine', label: 'Routine' },
                  { value: 'repair', label: 'Repair' },
                  { value: 'inspection', label: 'Inspection' }
                ]}
                size="sm"
                fullWidth
              />
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="blue-solid"
                  fullWidth
                  icon={<PlusIcon className="w-5 h-5" />}
                >
                  Tambah Jadwal
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-4 border-b bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <h3 className="font-bold text-neutral-800 dark:text-white">Jadwal 维护 ({maintenanceSchedules.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Barang</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                  {maintenanceSchedules.map(schedule => (
                    <tr key={schedule.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-3 font-medium text-neutral-900 dark:text-white">{schedule.itemName}</td>
                      <td className="px-4 py-3">{schedule.scheduledDate}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info" size="sm">
                          {schedule.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            schedule.status === 'completed' ? 'success' :
                            schedule.status === 'in-progress' ? 'warning' :
                            schedule.status === 'overdue' ? 'error' :
                            'neutral'
                          }
                          size="sm"
                        >
                          {schedule.status}
                        </Badge>
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
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Audit Inventaris</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Lakukan audit untuk memverifikasi kecocokan data inventaris dengan kondisi aktual.
              </p>
              <Button
                onClick={startAudit}
                variant="green-solid"
                size="lg"
                icon={<DocumentTextIcon />}
                className="mx-auto"
              >
                Mulai Audit Baru
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Audit Sedang Berlangsung</h3>
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
                  <Button
                    onClick={completeAudit}
                    variant="green-solid"
                  >
                    Selesaikan Audit
                  </Button>
                  <Button
                    onClick={() => setAuditMode(false)}
                    variant="secondary"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Audit History */}
          {audits.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="p-4 border-b bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <h3 className="font-bold text-neutral-800 dark:text-white">Riwayat Audit</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                  <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-4 py-3">Auditor</th>
                      <th className="px-4 py-3">Total Barang</th>
                      <th className="px-4 py-3">Cocok</th>
                      <th className="px-4 py-3">Tidak Cocok</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {audits.map(audit => (
                      <tr key={audit.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                        <td className="px-6 py-3">{audit.auditDate}</td>
                        <td className="px-4 py-3">{audit.auditor}</td>
                        <td className="px-4 py-3">{audit.totalItems}</td>
                        <td className="px-4 py-3">{audit.matchedItems}</td>
                        <td className="px-4 py-3">{audit.mismatchedItems}</td>
                        <td className="px-4 py-3">
                          <Badge variant="success" size="sm">
                            {audit.status}
                          </Badge>
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
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Laporan Inventaris</h3>
            <Button
              onClick={exportReport}
              variant="blue-solid"
              size="sm"
              icon={<ArrowDownTrayIcon />}
            >
              Export Laporan
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Nilai Aset</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">Rp {report.totalValue.toLocaleString()}</p>
                </div>
                <ChartBarIcon />
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Barang</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{report.totalItems}</p>
                </div>
                <ArchiveBoxIcon />
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Jadwal 维护 Aktif</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{maintenanceSchedules.length}</p>
                </div>
                <CalendarDaysIcon />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Chart */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Distribusi Kategori</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.categoryBreakdown as Array<{category: string; value: number; count: number}>}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={CHART_COLORS.indigo}
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
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Status Kondisi</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.conditionBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="condition" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} barang`, 'Jumlah']} />
                  <Bar dataKey="count" fill={CHART_COLORS.green} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Depreciation Chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Analisis Depresiasi</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={report.depreciationData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString()}`, '']} />
                <Legend />
                <Area type="monotone" dataKey="purchaseValue" stackId="1" stroke={CHART_COLORS.purple} fill={CHART_COLORS.purple} name="Nilai Pembelian" />
                <Area type="monotone" dataKey="currentValue" stackId="2" stroke={CHART_COLORS.emerald} fill={CHART_COLORS.emerald} name="Nilai Saat Ini" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRCode !== null}
        onClose={() => setShowQRCode(null)}
        title="QR Code Barang"
        size="sm"
        animation="scale-in"
        closeOnBackdropClick={true}
        closeOnEscape={true}
        showCloseButton={true}
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
            {showQRCode && (
              <img src={showQRCode} alt="QR Code barang" className="w-full" />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (showQRCode) {
                  const link = document.createElement('a');
                  link.download = 'qrcode.png';
                  link.href = showQRCode;
                  link.click();
                  onShowToast('QR Code berhasil diunduh.', 'success');
                }
              }}
              variant="blue-solid"
              fullWidth
            >
              Unduh
            </Button>
            <Button
              onClick={() => setShowQRCode(null)}
              variant="secondary"
              fullWidth
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Hapus Barang"
        message="Apakah Anda yakin ingin menghapus barang ini dari daftar?"
        type="danger"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteItem}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default SchoolInventory;