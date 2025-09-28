import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import type { Address, NewAddressInput } from '../types/address';

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error || new Error('Not authenticated');
  return data.user.id;
}

export async function listAddresses(): Promise<Address[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as Address[]) ?? [];
}

export async function createAddress(input: NewAddressInput & { is_default?: boolean }): Promise<Address> {
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

  return created;
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
