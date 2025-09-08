import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type WorkerProfile = Database['public']['Tables']['worker_profiles']['Row'];
type WorkerProfileInsert = Database['public']['Tables']['worker_profiles']['Insert'];
type WorkerProfileUpdate = Database['public']['Tables']['worker_profiles']['Update'];
type WorkerListing = Database['public']['Views']['worker_listings']['Row'];

export interface Worker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  avatar: string | null;
  location: { latitude: number; longitude: number };
  services: string[];
  price: number;
  isAvailable: boolean;
  businessName?: string;
  bio?: string;
  experienceYears?: number;
}

export interface NearbyWorkerResult {
  worker_id: string;
  user_id: string;
  full_name: string;
  worker_rating: number;
  distance_km: number;
  base_price: number;
}

class WorkersService {
  // Get all available workers
  async getWorkers(): Promise<Worker[]> {
    try {
      const { data, error } = await supabase
        .from('worker_listings')
        .select('*')
        .eq('status', 'available');

      if (error) throw error;

      return this.transformWorkersData(data || []);
    } catch (error) {
      console.error('Get workers error:', error);
      throw error;
    }
  }

  // Find nearby workers using PostGIS function
  async findNearbyWorkers(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    serviceId?: string
  ): Promise<NearbyWorkerResult[]> {
    try {
      const { data, error } = await supabase.rpc('find_nearby_workers', {
        customer_lat: latitude,
        customer_lon: longitude,
        radius_km: radiusKm,
        service_uuid: serviceId || null,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Find nearby workers error:', error);
      throw error;
    }
  }

  // Get worker by ID
  async getWorkerById(workerId: string): Promise<Worker | null> {
    try {
      const { data, error } = await supabase
        .from('worker_listings')
        .select('*')
        .eq('worker_id', workerId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformWorkerData(data);
    } catch (error) {
      console.error('Get worker by ID error:', error);
      throw error;
    }
  }

  // Create worker profile
  async createWorkerProfile(userId: string, profileData: Omit<WorkerProfileInsert, 'user_id'>) {
    try {
      const { data, error } = await supabase
        .from('worker_profiles')
        .insert({
          user_id: userId,
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create worker profile error:', error);
      throw error;
    }
  }

  // Update worker profile
  async updateWorkerProfile(workerId: string, updates: WorkerProfileUpdate) {
    try {
      const { data, error } = await supabase
        .from('worker_profiles')
        .update(updates)
        .eq('id', workerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update worker profile error:', error);
      throw error;
    }
  }

  // Update worker location
  async updateWorkerLocation(workerId: string, latitude: number, longitude: number) {
    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({
          current_location: `POINT(${longitude} ${latitude})`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workerId);

      if (error) throw error;
    } catch (error) {
      console.error('Update worker location error:', error);
      throw error;
    }
  }

  // Update worker status
  async updateWorkerStatus(workerId: string, status: 'available' | 'busy' | 'offline' | 'on_break') {
    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workerId);

      if (error) throw error;
    } catch (error) {
      console.error('Update worker status error:', error);
      throw error;
    }
  }

  // Get worker's services
  async getWorkerServices(workerId: string) {
    try {
      const { data, error } = await supabase
        .from('worker_services')
        .select(`
          *,
          services (
            id,
            key,
            title,
            description,
            base_price,
            category,
            icon_name
          )
        `)
        .eq('worker_id', workerId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get worker services error:', error);
      throw error;
    }
  }

  // Add service to worker
  async addWorkerService(workerId: string, serviceId: string, customPrice?: number) {
    try {
      const { data, error } = await supabase
        .from('worker_services')
        .insert({
          worker_id: workerId,
          service_id: serviceId,
          custom_price: customPrice,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add worker service error:', error);
      throw error;
    }
  }

  // Remove service from worker
  async removeWorkerService(workerId: string, serviceId: string) {
    try {
      const { error } = await supabase
        .from('worker_services')
        .delete()
        .eq('worker_id', workerId)
        .eq('service_id', serviceId);

      if (error) throw error;
    } catch (error) {
      console.error('Remove worker service error:', error);
      throw error;
    }
  }

  // Transform database data to app format
  private transformWorkersData(data: WorkerListing[]): Worker[] {
    return data.map(worker => this.transformWorkerData(worker));
  }

  private transformWorkerData(worker: WorkerListing): Worker {
    // Extract coordinates from PostGIS point
    const coordinates = this.extractCoordinatesFromPoint(worker.base_location);
    
    return {
      id: worker.worker_id,
      name: worker.full_name,
      rating: worker.worker_rating,
      reviewCount: worker.worker_review_count,
      avatar: worker.avatar_url,
      location: coordinates,
      services: worker.services || [],
      price: worker.avg_price || 0,
      isAvailable: worker.status === 'available',
      businessName: worker.business_name || undefined,
      bio: worker.bio || undefined,
      experienceYears: worker.experience_years || undefined,
    };
  }

  // Extract coordinates from PostGIS point format
  private extractCoordinatesFromPoint(point: any): { latitude: number; longitude: number } {
    // Default to Marrakech center if no point provided
    if (!point) {
      return { latitude: 31.6295, longitude: -7.9811 };
    }

    // Handle different PostGIS point formats
    if (typeof point === 'string') {
      // Parse "POINT(lng lat)" format
      const match = point.match(/POINT\(([^)]+)\)/);
      if (match) {
        const [lng, lat] = match[1].split(' ').map(Number);
        return { latitude: lat, longitude: lng };
      }
    }

    // Handle GeoJSON format
    if (point.coordinates && Array.isArray(point.coordinates)) {
      const [lng, lat] = point.coordinates;
      return { latitude: lat, longitude: lng };
    }

    // Fallback to Marrakech center
    return { latitude: 31.6295, longitude: -7.9811 };
  }
}

export const workersService = new WorkersService();
