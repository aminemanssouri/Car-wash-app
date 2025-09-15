import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ArrowLeft, MapPin, Home, Briefcase, Navigation, Check } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useModal } from '../contexts/ModalContext';

interface AddressForm {
  label: string;
  address: string;
  city: string;
  postalCode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const ADDRESS_TYPES = [
  { label: 'Home', value: 'home', icon: Home },
  { label: 'Work', value: 'work', icon: Briefcase },
  { label: 'Other', value: 'other', icon: MapPin },
] as const;

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { t } = useLanguage();
  const { show } = useModal();
  
  const [form, setForm] = useState<AddressForm>({
    label: '',
    address: '',
    city: '',
    postalCode: '',
    type: 'home',
    isDefault: false,
  });
  
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const onChange = (key: keyof AddressForm, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!form.label.trim()) {
      show({
        type: 'warning',
        title: t('validation_error') || 'Validation Error',
        message: t('address_label_required') || 'Address label is required',
      });
      return;
    }

    if (!form.address.trim()) {
      show({
        type: 'warning',
        title: t('validation_error') || 'Validation Error',
        message: t('address_required') || 'Address is required',
      });
      return;
    }

    setSaving(true);
    try {
      // TODO: Save to Supabase addresses table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      show({
        type: 'success',
        title: t('address_saved') || 'Address Saved',
        message: t('address_saved_message') || 'Your address has been saved successfully',
      });
      
      // Navigate back after a short delay
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      show({
        type: 'warning',
        title: t('error') || 'Error',
        message: t('failed_to_save_address') || 'Failed to save address. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        show({
          type: 'warning',
          title: t('permission_required') || 'Permission Required',
          message: t('location_permission_message') || 'Location permission is required to use current location',
        });
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const streetAddress = `${address.streetNumber || ''} ${address.street || ''}`.trim();
        
        // Auto-fill form fields
        setForm(prev => ({
          ...prev,
          address: streetAddress || `${address.name || ''} ${address.district || ''}`.trim(),
          city: address.city || address.subregion || 'Marrakech',
          postalCode: address.postalCode || '',
          label: prev.label || 'Current Location',
        }));

        show({
          type: 'success',
          title: t('location_found') || 'Location Found',
          message: t('location_auto_filled') || 'Address fields have been auto-filled with your current location',
        });
      } else {
        show({
          type: 'warning',
          title: t('location_error') || 'Location Error',
          message: t('unable_to_get_address') || 'Unable to get address from current location',
        });
      }
    } catch (error) {
      show({
        type: 'warning',
        title: t('location_error') || 'Location Error',
        message: t('failed_to_get_location') || 'Failed to get current location. Please try again.',
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeData = ADDRESS_TYPES.find(t => t.value === type);
    return typeData?.icon || MapPin;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header 
        title={t('add address') || 'Add Address'} 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Address Type Selection */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('address type') || 'Address Type'}</Text>
          </View>
          
          <View style={styles.typeSelector}>
            {ADDRESS_TYPES.map((type) => {
              const IconComponent = type.icon;
              const isSelected = form.type === type.value;
              return (
                <Pressable
                  key={type.value}
                  style={[
                    styles.typeOption,
                    { borderColor: theme.cardBorder, backgroundColor: theme.bg },
                    isSelected && { borderColor: theme.accent, backgroundColor: theme.surface }
                  ]}
                  onPress={() => onChange('type', type.value)}
                >
                  <IconComponent 
                    size={20} 
                    color={isSelected ? theme.accent : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.typeText,
                    { color: isSelected ? theme.accent : theme.textSecondary }
                  ]}>
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Address Details */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Home size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('address details') || 'Address Details'}</Text>
          </View>
          
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('address label') || 'Label'}</Text>
            <Input
              value={form.label}
              onChangeText={(v) => onChange('label', v)}
              placeholder={t('address label placeholder') || 'e.g., Home, Office, Gym'}
              style={[styles.fieldInput, { borderColor: theme.cardBorder, backgroundColor: theme.bg }]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('street address') || 'Street Address'}</Text>
            <Input
              value={form.address}
              onChangeText={(v) => onChange('address', v)}
              placeholder={t('street address placeholder') || 'Enter street address'}
              multiline
              numberOfLines={2}
              style={[styles.fieldInput, styles.multilineInput, { borderColor: theme.cardBorder, backgroundColor: theme.bg }]}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('city') || 'City'}</Text>
              <Input
                value={form.city}
                onChangeText={(v) => onChange('city', v)}
                placeholder={t('city ') || 'Marrakech'}
                style={[styles.fieldInput, { borderColor: theme.cardBorder, backgroundColor: theme.bg }]}
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('postal code') || 'Postal Code'}</Text>
              <Input
                value={form.postalCode}
                onChangeText={(v) => onChange('postalCode', v)}
                placeholder={t('postal code') || '40000'}
                keyboardType="numeric"
                style={[styles.fieldInput, { borderColor: theme.cardBorder, backgroundColor: theme.bg }]}
              />
            </View>
          </View>
        </Card>

        {/* Location Services */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Navigation size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('location services') || 'Location Services'}</Text>
          </View>
          
          <Button 
            variant="outline" 
            onPress={handleUseCurrentLocation}
            disabled={loadingLocation}
            style={[styles.locationButton, { borderColor: theme.cardBorder }]}
          >
            <View style={styles.locationButtonContent}>
              <Navigation size={18} color={loadingLocation ? theme.textSecondary : theme.accent} />
              <Text style={[styles.locationButtonText, { color: loadingLocation ? theme.textSecondary : theme.textPrimary }]}>
                {loadingLocation ? (t('getting location') || 'Getting Location...') : (t('use current location') || 'Use Current Location')}
              </Text>
            </View>
          </Button>
        </Card>

        {/* Default Address Option */}
        <Card style={styles.sectionCard}>
          <Pressable 
            style={styles.defaultOption}
            onPress={() => onChange('isDefault', !form.isDefault)}
          >
            <View style={styles.defaultOptionLeft}>
              <View style={[
                styles.checkbox,
                { borderColor: theme.cardBorder },
                form.isDefault && { backgroundColor: theme.accent, borderColor: theme.accent }
              ]}>
                {form.isDefault && <Check size={14} color="white" />}
              </View>
              <View>
                <Text style={[styles.defaultTitle, { color: theme.textPrimary }]}>
                  {t('set as default') || 'Set as Default Address'}
                </Text>
                <Text style={[styles.defaultSubtitle, { color: theme.textSecondary }]}>
                  {t('default address description') || 'Use this address for future bookings by default'}
                </Text>
              </View>
            </View>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 40, height: 40 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveButton: { width: 40, height: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { paddingTop: 20, paddingBottom: 32, gap: 20 },
  
  // Section Cards
  sectionCard: { padding: 20, marginBottom: 0 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  
  // Type Selector
  typeSelector: { flexDirection: 'row', gap: 12 },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    gap: 8,
  },
  typeText: { fontSize: 14, fontWeight: '500' },
  
  // Form Fields
  fieldGroup: { marginBottom: 20 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start' },
  fieldLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  fieldInput: { 
    fontSize: 16, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    minHeight: 48,
  },
  multilineInput: { minHeight: 72, textAlignVertical: 'top' },
  
  // Location Button
  locationButton: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 16, minHeight: 56 },
  locationButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  locationButtonText: { fontSize: 16, fontWeight: '500' },
  
  // Default Option
  defaultOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  defaultOptionLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  defaultTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  defaultSubtitle: { fontSize: 14, lineHeight: 20 },
});
