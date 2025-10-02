import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { handleSupabaseError, retryOperation, getCachedData, setCachedData, CACHE_KEYS } from './utils';

type WorkerProfile = Database['public']['Tables']['worker_profiles']['Row'];
type WorkerProfileInsert = Database['public']['Tables']['worker_profiles']['Insert'];
type WorkerProfileUpdate = Database['public']['Tables']['worker_profiles']['Update'];
type WorkerListing = Database['public']['Views']['worker_listings']['Row'];

export interface Worker {
  id: string;
  userId: string;
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
  // Enhanced fields from database
  status: 'available' | 'busy' | 'offline' | 'on_break';
  serviceRadiusKm: number;
  hourlyRate?: number;
  totalJobsCompleted: number;
  totalEarnings: number;
  averageCompletionTime?: number;
  worksWeekends: boolean;
  startTime: string;
  endTime: string;
  specialties?: string[];
  distanceKm?: number;
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
  // Get all available workers with caching
  async getWorkers(useCache: boolean = true): Promise<Worker[]> {
    try {
      // Try cache first
      if (useCache) {
        const cached = await getCachedData<Worker[]>(CACHE_KEYS.WORKERS);
        if (cached) return cached;
      }

      const workers = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('worker_listings')
          .select('*')
          .eq('status', 'available');

        if (error) throw error;
        return (data || []).map(worker => this.transformWorkerData(worker));
      });

      // Cache successful result
      await setCachedData(CACHE_KEYS.WORKERS, workers, 6); // Cache for 6 hours
      return workers;
    } catch (error) {
      console.error('Get workers error:', error);
      
      // Try fallback from cache
      const fallbackData = await getCachedData<Worker[]>(CACHE_KEYS.WORKERS);
      if (fallbackData) {
        console.log('Returning cached workers as fallback');
        return fallbackData;
      }
      
      throw handleSupabaseError(error);
    }
  }

  // Find nearby workers using PostGIS function with enhanced error handling
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
      throw handleSupabaseError(error);
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

  // Get workers by service key
  async getWorkersByService(serviceKey: string, useCache: boolean = true): Promise<Worker[]> {
    try {
      // Try cache first
      const cacheKey = `${CACHE_KEYS.WORKERS}_service_${serviceKey}`;
      if (useCache) {
        const cached = await getCachedData<Worker[]>(cacheKey);
        if (cached) return cached;
      }

      const workers = await retryOperation(async () => {
        // Get service ID first
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('id')
          .eq('key', serviceKey)
          .eq('is_active', true)
          .single();

        if (serviceError) throw serviceError;
        if (!service) return [];

        // Get workers who offer this service
        const { data, error } = await supabase
          .from('worker_listings')
          .select(`
            *,
            worker_services!inner(service_id, is_active)
          `)
          .eq('status', 'available')
          .eq('worker_services.service_id', service.id)
          .eq('worker_services.is_active', true);

        if (error) throw error;
        return (data || []).map(worker => this.transformWorkerData(worker));
      });

      // Cache the results
      await setCachedData(cacheKey, workers, 4); // Cache for 4 hours
      return workers;
    } catch (error) {
      console.error('Get workers by service error:', error);
      
      // Try fallback from cache
      const cacheKey = `${CACHE_KEYS.WORKERS}_service_${serviceKey}`;
      const fallbackData = await getCachedData<Worker[]>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached workers by service as fallback');
        return fallbackData;
      }
      
      throw handleSupabaseError(error);
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

    // Find nearby workers with full details and service filtering
  async findNearbyWorkersWithDetails(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    serviceKey?: string
  ): Promise<Worker[]> {
    try {
      // Get service ID if serviceKey is provided
      let serviceId: string | null = null;
      if (serviceKey) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('id')
          .eq('key', serviceKey)
          .single();
        
        if (serviceData) {
          serviceId = serviceData.id;
        }
      }
      
      // Find nearby workers
      const nearbyResults = await this.findNearbyWorkers(
        latitude, 
        longitude, 
        radiusKm, 
        serviceId || undefined
      );
      
      if (nearbyResults.length === 0) return [];
      
      // Get full worker details
      const workerIds = nearbyResults.map(w => w.worker_id);
      
      const { data: workerDetails, error } = await supabase
        .from('worker_listings')
        .select('*')
        .in('worker_id', workerIds)
        .eq('status', 'available');
        
      if (error) throw error;
      
      // Transform and merge with distance data
      return this.transformWorkersData(workerDetails || []).map(worker => {
        const nearbyData = nearbyResults.find(n => n.worker_id === worker.id);
        return {
          ...worker,
          // Add distance information if available
          distance: nearbyData?.distance_km
        } as Worker & { distance?: number };
      });
    } catch (error) {
      console.error('Find nearby workers with details error:', error);
      throw handleSupabaseError(error);
    }
  }

  // Get worker availability for specific date and time
  async checkWorkerAvailability(
    workerId: string,
    date: string,
    time: string,
    duration: number = 120 // in minutes
  ): Promise<{ available: boolean; conflictingBookings?: number }> {
    try {
      const requestedDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(requestedDateTime.getTime() + duration * 60000);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('scheduled_date, scheduled_time, estimated_duration')
        .eq('worker_id', workerId)
        .eq('scheduled_date', date)
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (error) throw error;

      const conflicts = (data || []).filter(booking => {
        const bookingStart = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
        const bookingEnd = new Date(bookingStart.getTime() + booking.estimated_duration * 60000);
        
        // Check for time overlap
        return (
          (requestedDateTime >= bookingStart && requestedDateTime < bookingEnd) ||
          (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
          (requestedDateTime <= bookingStart && endDateTime >= bookingEnd)
        );
      });

      return {
        available: conflicts.length === 0,
        conflictingBookings: conflicts.length
      };
    } catch (error) {
      console.error('Check worker availability error:', error);
      throw handleSupabaseError(error);
    }
  }

  // Transform database worker data to app format
  private transformWorkersData(data: WorkerListing[]): Worker[] {
    return data.map(worker => this.transformWorkerData(worker));
  }

  private transformWorkerData(worker: WorkerListing): Worker {
    // Extract coordinates from PostGIS point
    const coordinates = this.extractCoordinatesFromPoint(worker.base_location);
    
    return {
      id: worker.worker_id,
      userId: worker.user_id,
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
      // Enhanced fields from database
      status: worker.status,
      serviceRadiusKm: worker.service_radius_km,
      hourlyRate: worker.hourly_rate || undefined,
      totalJobsCompleted: 0, // Not available in worker_listings view
      totalEarnings: 0, // Not available in worker_listings view
      averageCompletionTime: undefined, // Not available in worker_listings view
      worksWeekends: true, // Default value, not in worker_listings view
      startTime: '08:00', // Default value, not in worker_listings view
      endTime: '18:00', // Default value, not in worker_listings view
      specialties: worker.services || undefined,
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
