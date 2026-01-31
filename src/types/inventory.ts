export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  depreciationRate?: number;
  currentValue?: number;
  qrCode?: string;
  barcode?: string;
  notes?: string;
  assignedTo?: string;
  status?: 'active' | 'maintenance' | 'disposed' | 'lost';
}

export interface MaintenanceSchedule {
  id: string;
  itemId: string;
  itemName: string;
  scheduledDate: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
}

export interface InventoryAudit {
  id: string;
  auditDate: string;
  auditor: string;
  items: AuditItem[];
  status: 'in-progress' | 'completed' | 'approved';
  notes?: string;
  totalItems: number;
  matchedItems: number;
  mismatchedItems: number;
  missingItems: number;
}

export interface AuditItem {
  itemId: string;
  expectedQuantity: number;
  actualQuantity: number;
  condition: 'matched' | 'mismatch' | 'missing';
  notes?: string;
}

export interface InventoryReport {
  totalValue: number;
  totalItems: number;
  categoryBreakdown: CategoryReport[];
  conditionBreakdown: ConditionReport[];
  depreciationData: DepreciationReport[];
  maintenanceSchedule: MaintenanceSchedule[];
}

export interface CategoryReport {
  category: string;
  count: number;
  value: number;
}

export interface ConditionReport {
  condition: string;
  count: number;
  percentage: number;
}

export interface DepreciationReport {
  itemName: string;
  purchaseValue: number;
  currentValue: number;
  depreciationAmount: number;
  depreciationPercentage: number;
}
