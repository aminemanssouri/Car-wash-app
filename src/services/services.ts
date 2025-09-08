import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Service = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export interface ServiceItem {
  id: string;
  key: string;
  title: string;
  desc: string;
  price: number;
  icon: string;
  category: 'basic' | 'deluxe' | 'premium' | 'specialty';
  durationMinutes: number;
  isActive: boolean;
}

class ServicesService {
  // Get all active services
  async getServices(): Promise<ServiceItem[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('base_price', { ascending: true });

      if (error) throw error;

      return (data || []).map(service => this.transformServiceData(service));
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  }

  // Get service by ID
  async getServiceById(serviceId: string): Promise<ServiceItem | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformServiceData(data);
    } catch (error) {
      console.error('Get service by ID error:', error);
      throw error;
    }
  }

  // Get service by key
  async getServiceByKey(key: string): Promise<ServiceItem | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('key', key)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformServiceData(data);
    } catch (error) {
      console.error('Get service by key error:', error);
      throw error;
    }
  }

  // Get services by category
  async getServicesByCategory(category: 'basic' | 'deluxe' | 'premium' | 'specialty'): Promise<ServiceItem[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('base_price', { ascending: true });

      if (error) throw error;

      return (data || []).map(service => this.transformServiceData(service));
    } catch (error) {
      console.error('Get services by category error:', error);
      throw error;
    }
  }

  // Calculate service price based on vehicle type
  calculateServicePrice(service: ServiceItem, vehicleType: 'sedan' | 'suv' | 'hatchback' | 'van' | 'truck' | 'motorcycle'): number {
    const basePrice = service.price;
    
    // Get multiplier from database or use defaults
    const multipliers = {
      sedan: 1.00,
      hatchback: 1.00,
      suv: 1.20,
      van: 1.40,
      truck: 1.60,
      motorcycle: 0.80,
    };

    return Math.round(basePrice * multipliers[vehicleType]);
  }

  // Create new service (admin only)
  async createService(serviceData: Omit<ServiceInsert, 'id'>): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  }

  // Update service (admin only)
  async updateService(serviceId: string, updates: ServiceUpdate): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  }

  // Deactivate service (admin only)
  async deactivateService(serviceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;
    } catch (error) {
      console.error('Deactivate service error:', error);
      throw error;
    }
  }

  // Get popular services (most booked)
  async getPopularServices(limit: number = 5): Promise<ServiceItem[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          bookings!inner(service_id)
        `)
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;

      // Sort by booking count and transform
      const servicesWithBookingCount = (data || [])
        .map((service: any) => ({
          ...service,
          booking_count: service.bookings?.length || 0
        }))
        .sort((a: any, b: any) => b.booking_count - a.booking_count);

      return servicesWithBookingCount.map((service: any) => this.transformServiceData(service));
    } catch (error) {
      console.error('Get popular services error:', error);
      // Fallback to regular services if booking count query fails
      return this.getServices();
    }
  }

  // Transform database service to app format
  private transformServiceData(service: Service): ServiceItem {
    return {
      id: service.id,
      key: service.key,
      title: service.title,
      desc: service.description || '',
      price: service.base_price,
      icon: service.icon_name || 'Wrench',
      category: service.category,
      durationMinutes: service.duration_minutes,
      isActive: service.is_active,
    };
  }
}

export const servicesService = new ServicesService();
