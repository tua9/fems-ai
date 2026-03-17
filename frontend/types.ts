
export type Status = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'RETURNED' | 'OVERDUE' | 'APPROVED';

export interface Equipment {
  id: string;
  name: string;
  serial: string;
  location: string;
  status: 'Available' | 'In Use' | 'Under Maintenance';
  type: string;
  image: string;
}

export interface BorrowRecord {
  id: string;
  equipmentName: string;
  deviceId: string;
  period: string;
  status: Status;
  image: string;
  condition?: string;
  purpose?: string;
}

export interface IssueReport {
  id: string;
  date: string;
  subject: string;
  status: Status;
  location?: string;
  category?: string;
}

export interface User {
  name: string;
  id: string;
  email: string;
  major: string;
  campus: string;
  dob: string;
  citizenshipId: string;
  role: string;
}

