export interface ChecklistType {
  id: string;
  name: string;
  description: string;
  fields: ChecklistField[];
  category: 'electrical' | 'maintenance' | 'inspection' | 'installation';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'date' | 'time';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  section: string;
  order: number;
}

export interface ChecklistTemplate {
  id: string;
  typeId: string;
  name: string;
  description: string;
  isDefault: boolean;
  fields: ChecklistField[];
}

export interface ChecklistInstance {
  id: string;
  typeId: string;
  templateId?: string;
  data: Record<string, unknown>;
  status: 'draft' | 'completed' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedBy?: string;
  linkToken?: string;
  source: 'direct' | 'link';
}

// Tipos predefinidos de checklist
export const CHECKLIST_TYPES = {
  RVE: {
    id: 'rve',
    name: 'Instalación RVE',
    description: 'Revisión de Medidores y Equipos',
    category: 'electrical' as const,
    isActive: true
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Mantenimiento Preventivo',
    description: 'Checklist de mantenimiento preventivo',
    category: 'maintenance' as const,
    isActive: true
  },
  INSPECTION: {
    id: 'inspection',
    name: 'Inspección de Seguridad',
    description: 'Inspección de seguridad eléctrica',
    category: 'inspection' as const,
    isActive: true
  }
} as const;

export type ChecklistTypeId = keyof typeof CHECKLIST_TYPES;
