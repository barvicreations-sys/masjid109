export interface Student {
  id: string;
  studentId: string; // Manual ID (Auto-generated in logic)
  name: string;
  fatherName: string;
  caste: string;
  age: number;
  address: string;
  phoneNumber: string;
  gmail: string;
  dateOfAdmission: string;
  reference: string;
  guardianId?: string;
}

export interface NamazRecord {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface DailyReport {
  id: string;
  studentId: string;
  date: string;
  sabak: string;
  sabqi: string;
  manzil: string;
  duain: string;
  namaz: NamazRecord;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  name: string;
  date: string;
}

export interface AdminUser {
  uid: string;
  email: string;
}
