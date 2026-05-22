export type TabType = 
  | 'overview' 
  | 'monitor' 
  | 'registry' 
  | 'registry-inventory'
  | 'registry-definition'
  | 'floormap' 
  | 'floormap-devices'
  | 'floormap-layout'
  | 'configuration' 
  | 'explorer' 
  | 'alerts' 
  | 'integrations' 
  | 'security' 
  | 'admin' 
  | 'settings';

export type Language = 'en' | 'fr' | 'sw' | 'rw';
export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'Super Admin' | 'Admin' | 'Operator' | 'Technician' | 'User';
  email: string;
  permissions: TabType[];
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: string;
}

export interface SensorData {
  value: number;
  history: number[];
  drift: number;
  min: number;
  max: number;
  unit: string;
}

export interface DashboardState {
  water: SensorData;
  temp: SensorData;
  air: SensorData;
  power: SensorData;
}

const ALL_TABS: TabType[] = [
  'overview', 'monitor', 'registry', 'floormap', 'configuration',
  'explorer', 'alerts',
  'integrations', 'security', 'admin', 'settings'
];

export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'A. Kamau',
    username: 'a.kamau',
    password: 'admin123',
    role: 'Super Admin',
    email: 'a.kamau@ishmatek.com',
    permissions: [...ALL_TABS],
    status: 'Active',
    lastLogin: '2 mins ago'
  },
  {
    id: '2',
    name: 'J. Uwimana',
    username: 'j.uwimana',
    password: 'tech123',
    role: 'Technician',
    email: 'j.uwimana@ishmatek.com',
    permissions: ['overview', 'monitor', 'registry', 'floormap'],
    status: 'Active',
    lastLogin: '1 hour ago'
  },
  {
    id: '3',
    name: 'M. Nzabonimpa',
    username: 'm.nzabonimpa',
    password: 'oper123',
    role: 'Operator',
    email: 'm.nzabonimpa@ishmatek.com',
    permissions: ['overview', 'monitor', 'alerts'],
    status: 'Inactive',
    lastLogin: '2 days ago'
  },
  {
    id: '4',
    name: 'S. Ishimwe',
    username: 's.ishimwe',
    password: 'admin123',
    role: 'Admin',
    email: 's.ishimwe@ishmatek.com',
    permissions: ['overview', 'monitor', 'admin', 'settings'],
    status: 'Active',
    lastLogin: 'Just now'
  },
];

export function seedDefaultUsers() {
  if (!localStorage.getItem('nexus_admin_users')) {
    localStorage.setItem('nexus_admin_users', JSON.stringify(DEFAULT_USERS));
  }
}
