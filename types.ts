export enum ViewState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
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
  doctor: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  patientName?: string; // New field for admin view
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

export interface Doctor {
  id: string;
  name: string;
  specialties: string[]; // Array of TreatmentType IDs
  rating: number;
}