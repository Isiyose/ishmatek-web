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
