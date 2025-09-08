import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
type BookingDetails = Database['public']['Views']['booking_details']['Row'];

export interface CreateBookingData {
  workerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceAddressText: string;
  vehicleType: 'sedan' | 'suv' | 'hatchback' | 'van' | 'truck' | 'motorcycle';
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  licensePlate?: string;
  basePrice: number;
  totalPrice: number;
  specialInstructions?: string;
  estimatedDuration: number;
  serviceLocation?: { latitude: number; longitude: number };
}

export interface BookingWithDetails extends Booking {
  customerName: string;
  workerName: string;
  serviceName: string;
  workerRating: number;
  workerAvatar?: string;
}

class BookingsService {
  // Create new booking
  async createBooking(customerId: string, bookingData: CreateBookingData): Promise<Booking> {
    try {
      const insertData: BookingInsert = {
        customer_id: customerId,
        worker_id: bookingData.workerId,
        service_id: bookingData.serviceId,
        scheduled_date: bookingData.scheduledDate,
        scheduled_time: bookingData.scheduledTime,
        estimated_duration: bookingData.estimatedDuration,
        service_address_text: bookingData.serviceAddressText,
        vehicle_type: bookingData.vehicleType,
        vehicle_make: bookingData.vehicleMake,
        vehicle_model: bookingData.vehicleModel,
        vehicle_year: bookingData.vehicleYear,
        vehicle_color: bookingData.vehicleColor,
        license_plate: bookingData.licensePlate,
        base_price: bookingData.basePrice,
        total_price: bookingData.totalPrice,
        special_instructions: bookingData.specialInstructions,
        service_location: bookingData.serviceLocation 
          ? `POINT(${bookingData.serviceLocation.longitude} ${bookingData.serviceLocation.latitude})`
          : null,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getUserBookings(userId: string, role: 'customer' | 'worker' = 'customer'): Promise<BookingDetails[]> {
    try {
      let query = supabase.from('booking_details').select('*');

      if (role === 'customer') {
        query = query.eq('customer_id', userId);
      } else {
        // For workers, match against worker's user_id
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (workerProfile) {
          query = query.eq('worker_id', workerProfile.id);
        } else {
          return []; // No worker profile found
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<BookingDetails | null> {
    try {
      const { data, error } = await supabase
        .from('booking_details')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(
    bookingId: string, 
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded',
    userId?: string
  ): Promise<Booking> {
    try {
      const updateData: BookingUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set timestamps based on status
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.can_rate = true;
        updateData.can_cancel = false;
        updateData.can_reschedule = false;
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_by = userId;
        updateData.can_cancel = false;
        updateData.can_reschedule = false;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Booking> {
    try {
      const updateData: BookingUpdate = {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: reason,
        can_cancel: false,
        can_reschedule: false,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  // Reschedule booking
  async rescheduleBooking(
    bookingId: string,
    newDate: string,
    newTime: string
  ): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          scheduled_date: newDate,
          scheduled_time: newTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Reschedule booking error:', error);
      throw error;
    }
  }

  // Add notes to booking
  async addBookingNotes(
    bookingId: string,
    notes: string,
    noteType: 'customer' | 'worker'
  ): Promise<Booking> {
    try {
      const updateField = noteType === 'customer' ? 'customer_notes' : 'worker_notes';
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          [updateField]: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add booking notes error:', error);
      throw error;
    }
  }

  // Get bookings by status
  async getBookingsByStatus(
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
    userId?: string,
    role: 'customer' | 'worker' = 'customer'
  ): Promise<BookingDetails[]> {
    try {
      let query = supabase
        .from('booking_details')
        .select('*')
        .eq('status', status);

      if (userId) {
        if (role === 'customer') {
          query = query.eq('customer_id', userId);
        } else {
          // For workers, get worker profile first
          const { data: workerProfile } = await supabase
            .from('worker_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (workerProfile) {
            query = query.eq('worker_id', workerProfile.id);
          } else {
            return [];
          }
        }
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get bookings by status error:', error);
      throw error;
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings(userId: string, role: 'customer' | 'worker' = 'customer'): Promise<BookingDetails[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('booking_details')
        .select('*')
        .gte('scheduled_date', today)
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (role === 'customer') {
        query = query.eq('customer_id', userId);
      } else {
        // For workers, get worker profile first
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (workerProfile) {
          query = query.eq('worker_id', workerProfile.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get upcoming bookings error:', error);
      throw error;
    }
  }

  // Get booking history
  async getBookingHistory(userId: string, role: 'customer' | 'worker' = 'customer'): Promise<BookingDetails[]> {
    try {
      let query = supabase
        .from('booking_details')
        .select('*')
        .in('status', ['completed', 'cancelled']);

      if (role === 'customer') {
        query = query.eq('customer_id', userId);
      } else {
        // For workers, get worker profile first
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (workerProfile) {
          query = query.eq('worker_id', workerProfile.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get booking history error:', error);
      throw error;
    }
  }
}

export const bookingsService = new BookingsService();
