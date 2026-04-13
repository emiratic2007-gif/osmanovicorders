export interface Appointment {
  id: string; // Assuming there's an ID, usually UUID
  created_at?: string;
  customer_name: string;
  phone: string;
  email: string;
  vehicle_make_model: string;
  service_requested: string;
  preferred_date: string; // Fixed spelling
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
