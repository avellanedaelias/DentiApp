export enum ViewState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD', 
  RESET_PASSWORD = 'RESET_PASSWORD',   
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Appointment {
  id: string;
  date: string; // ISO Date string
  time: string;
  treatment: string;
  doctorId: string; // Foreign Key
  doctorName: string; // Display Name
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  patientName?: string; // New field for admin view
  clinicalNotes?: string; // Notas de evolución
}

export interface AppNotification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface TreatmentType {
  id: string;
  name: string;
  duration: number; // in minutes
}

// New interfaces for Scheduling
export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isWorking: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface DateRange {
  id: string;
  startDate: string; // ISO Date "YYYY-MM-DD"
  endDate: string;   // ISO Date "YYYY-MM-DD"
  reason: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialties: string[]; // Array of TreatmentType IDs
  rating: number;
  schedule: DaySchedule[]; // Array of 7 days
  blockedDates: DateRange[];
}