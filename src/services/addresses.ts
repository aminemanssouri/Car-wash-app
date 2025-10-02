import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import type { Address, NewAddressInput } from '../types/address';
import { handleSupabaseError, retryOperation, getCachedData, setCachedData, CACHE_KEYS } from './utils';

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error || new Error('Not authenticated');
  return data.user.id;
}

export async function listAddresses(useCache: boolean = true): Promise<Address[]> {
  try {
    // Try cache first
    if (useCache) {
      const cached = await getCachedData<Address[]>(CACHE_KEYS.ADDRESSES);
      if (cached) return cached;
    }

    const addresses = await retryOperation(async () => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      return (data as Address[]) ?? [];
    });

    // Cache successful result
    await setCachedData(CACHE_KEYS.ADDRESSES, addresses, 12); // Cache for 12 hours
    return addresses;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    
    // Try to return cached data as fallback
    const fallbackData = await getCachedData<Address[]>(CACHE_KEYS.ADDRESSES);
    if (fallbackData) {
      console.log('Returning cached addresses as fallback');
      return fallbackData;
    }
    
    throw handleSupabaseError(error);
  }
}

export async function createAddress(input: NewAddressInput & { is_default?: boolean }): Promise<Address> {
  try {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('addresses')
      .insert([{ ...input, user_id: userId }])
      .select('*')
      .single();
    if (error) throw error;

    const created = data as Address;

    if (input.is_default) {
      // Ensure single default: set others to false
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', created.id);
    }

    // Invalidate cache after creating new address
    await setCachedData(CACHE_KEYS.ADDRESSES, null, 0);

    return created;
  } catch (error) {
    console.error('Error creating address:', error);
    throw handleSupabaseError(error);
  }
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const userId = await getCurrentUserId();
  // Unset others, set this one
  const { error: e1 } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);
  if (e1) throw e1;
  const { error: e2 } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId);
  if (e2) throw e2;
}

export async function geocodeFreeTextAddress(address: string, city?: string) {
  const query = [address, city].filter(Boolean).join(', ');
  if (!query) return null;
  try {
    const results = await Location.geocodeAsync(query);
    if (results && results.length > 0) {
      const first = results[0];
      return { latitude: first.latitude, longitude: first.longitude };
    }
  } catch (e) {
    // swallow to allow UI fallback
  }
  return null;
}

export async function getAddressById(id: string): Promise<Address | null> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Address) ?? null;
}

export async function updateAddress(id: string, payload: Partial<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Address;
}
