import { User, Appointment, Doctor, TreatmentType, AppNotification, DaySchedule, DateRange } from '../types';

// CONFIGURATION
// Set to false to connect to your real .NET API (http://localhost:5000)
// Set to true to use local simulation data
const USE_MOCK = false;

// Use environment variable for Production (Vercel), fallback to Proxy for Local (Vite)
const API_URL = process.env.VITE_API_URL || '/api';

// --- MOCK DATA ---
const MOCK_USER: User = {
  id: '1',
  name: 'Juan Pérez',
  email: 'juan@test.com',
  phone: '555-0123'
};

const MOCK_TREATMENTS: TreatmentType[] = [
  { id: '1', name: 'Consulta General', duration: 30 },
  { id: '2', name: 'Limpieza Dental', duration: 45 },
  { id: '3', name: 'Blanqueamiento', duration: 60 },
  { id: '4', name: 'Urgencia', duration: 30 },
];

// Helper to create default schedule (Mon-Fri 9-17)
const createDefaultSchedule = (): DaySchedule[] => {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    isWorking: i !== 0 && i !== 6, // Mon-Fri working
    startTime: '09:00',
    endTime: '17:00'
  }));
};

let MOCK_DOCTORS: Doctor[] = [
  { 
    id: 'd1', 
    name: 'Dr. Ricardo Muelas', 
    specialties: ['1', '4'], 
    rating: 4.8,
    schedule: createDefaultSchedule(), // Default schedule
    blockedDates: []
  },
  { 
    id: 'd2', 
    name: 'Dra. Ana Sonrisa', 
    specialties: ['1', '2'], 
    rating: 4.9,
    schedule: Array.from({ length: 7 }, (_, i) => ({ // Solo trabaja mañana
      dayOfWeek: i,
      isWorking: i !== 0 && i !== 6,
      startTime: '08:00',
      endTime: '12:00'
    })),
    blockedDates: []
  },
  { 
    id: 'd3', 
    name: 'Dr. Pablo Brackets', 
    specialties: ['3'], 
    rating: 4.7,
    schedule: createDefaultSchedule(),
    blockedDates: []
  },
  { 
    id: 'd4', 
    name: 'Dra. Elena Raíz', 
    specialties: ['1', '4'], 
    rating: 5.0,
    schedule: createDefaultSchedule(),
    blockedDates: []
  },
  { 
    id: 'd5', 
    name: 'Dr. Marcos White', 
    specialties: ['2', '3'], 
    rating: 4.6,
    schedule: createDefaultSchedule(),
    blockedDates: []
  },
  { 
    id: 'd6', 
    name: 'Dra. Sofia Kids', 
    specialties: ['1', '2'], 
    rating: 4.9,
    schedule: createDefaultSchedule(),
    blockedDates: []
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '101',
    date: '2024-06-15',
    time: '14:30',
    treatment: 'Limpieza Dental',
    doctorId: 'd1',
    doctorName: 'Dr. Ricardo Muelas',
    status: 'confirmed',
    patientName: 'Juan Pérez'
  },
  {
    id: '102',
    date: '2024-02-10',
    time: '09:00',
    treatment: 'Consulta General',
    doctorId: 'd2',
    doctorName: 'Dra. Ana Sonrisa',
    status: 'completed',
    patientName: 'Maria Garcia'
  }
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 1, message: 'Recordatorio: Mañana tienes turno 14:30hs', isRead: false, createdAt: '15/06 09:00' },
  { id: 2, message: 'Bienvenido a DentiApp', isRead: false, createdAt: '10/06 10:00' }
];


// --- SERVICES ---

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_USER), 1000);
      });
    } else {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Error en login');
      return response.json();
    }
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ ...MOCK_USER, name, email }), 1000);
      });
    } else {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: '' })
      });
      if (!response.ok) throw new Error('Error en registro');
      return response.json();
    }
  }
};

export const doctorService = {
  getAll: async (): Promise<Doctor[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_DOCTORS), 500);
      });
    } else {
      const response = await fetch(`${API_URL}/doctors`);
      if (!response.ok) throw new Error('Error fetching doctors');
      return response.json();
    }
  },
  
  getTreatments: async (): Promise<TreatmentType[]> => {
     if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_TREATMENTS), 300);
      });
    } else {
      const response = await fetch(`${API_URL}/treatments`);
       if (!response.ok) throw new Error('Error fetching treatments');
      return response.json();
    }
  },

  // Mock methods for updating schedule (Only works in Mock mode for now)
  updateSchedule: async (doctorId: string, schedule: DaySchedule[]): Promise<void> => {
    if (USE_MOCK) {
      MOCK_DOCTORS = MOCK_DOCTORS.map(d => d.id === doctorId ? { ...d, schedule } : d);
      return Promise.resolve();
    }
    
    const response = await fetch(`${API_URL}/doctors/${doctorId}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    
    if (!response.ok) throw new Error('Error updating schedule');
  },

  addBlockedDate: async (doctorId: string, blocked: DateRange): Promise<void> => {
    if (USE_MOCK) {
      MOCK_DOCTORS = MOCK_DOCTORS.map(d => d.id === doctorId ? { ...d, blockedDates: [...d.blockedDates, blocked] } : d);
      return Promise.resolve();
    }
    
    const response = await fetch(`${API_URL}/doctors/${doctorId}/blocked-dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocked)
    });
  
    if (!response.ok) throw new Error('Error adding blocked date');
  }
};

export const appointmentService = {
  getByUser: async (userId: string): Promise<Appointment[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_APPOINTMENTS), 800);
      });
    } else {
      const response = await fetch(`${API_URL}/appointments/user/${userId}`);
      if (!response.ok) throw new Error('Error obteniendo turnos');
      return response.json();
    }
  },

  getAllByDate: async (date: string): Promise<Appointment[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_APPOINTMENTS.filter(a => a.date === date)), 800);
      });
    } else {
      const response = await fetch(`${API_URL}/appointments?date=${date}`);
      if (!response.ok) throw new Error('Error obteniendo agenda');
      return response.json();
    }
  },

  create: async (userId: string, date: string, time: string, treatment: string, doctorId: string): Promise<Appointment> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const doc = MOCK_DOCTORS.find(d => d.id === doctorId);
          const newAppt: Appointment = {
            id: Date.now().toString(),
            date,
            time,
            treatment,
            doctorId: doctorId,
            doctorName: doc ? doc.name : 'Desconocido',
            status: 'confirmed'
          };
          resolve(newAppt);
        }, 1500);
      });
    } else {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: parseInt(userId), 
          date: `${date}T${time}:00`, 
          treatment,
          doctorId: doctorId 
        })
      });
      
      if (!response.ok) {
        // Intentar leer el mensaje de error del backend
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error creando turno');
        } catch (e: any) {
           // Si falla el parseo JSON o es otro error, lanzar el mensaje original si existe
           throw new Error(e.message || 'Error creando turno');
        }
      }
      return response.json();
    }
  },

  cancel: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } else {
      const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Error cancelando turno');
    }
  }
};

export const notificationService = {
  getUnread: async (userId: string): Promise<AppNotification[]> => {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_NOTIFICATIONS), 500));
    } else {
      const response = await fetch(`${API_URL}/notifications/user/${userId}`);
      if (!response.ok) return []; // Fallback silencioso
      return response.json();
    }
  },

  markAsRead: async (id: number): Promise<void> => {
    if (USE_MOCK) return;
    await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
  }
};