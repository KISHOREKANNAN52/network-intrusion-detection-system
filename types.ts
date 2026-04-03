export enum AttackType {
  NORMAL = 'Normal',
  DOS = 'DoS (Denial of Service)',
  PROBE = 'Probe (Port Scanning)',
  U2R = 'U2R (User to Root)',
  R2L = 'R2L (Remote to Local)',
}

export interface Packet {
  id: string;
  timestamp: Date;
  sourceIp: string;
  destIp: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  length: number;
  flag: string;
  prediction: AttackType;
  confidence: number;
  isAnomaly: boolean;
}

// We now only use the "Best" algorithm
export enum ModelAlgorithm {
  GRADIENT_BOOSTING = 'Gradient Boosting (Best Model)',
}

export interface SystemStats {
  totalPackets: number;
  intrusionCount: number;
  normalCount: number;
  activeThreatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ChartDataPoint {
  time: string;
  normal: number;
  attack: number;
}

export type ViewState = 
  | 'dashboard' 
  | 'upload' 
  | 'details-total' 
  | 'details-intrusion' 
  | 'details-safe' 
  | 'details-threat';
