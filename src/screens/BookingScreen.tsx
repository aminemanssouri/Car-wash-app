import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { ArrowLeft, MapPin, Car, CreditCard, Calendar } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

// Mock worker data
const mockWorkers = {
  "1": { 
    name: "Ahmed Benali", 
    price: 80, 
    avatar: require('../../assets/images/professional-car-washer-ahmed.png') 
  },
  "2": { 
    name: "Omar Hassan", 
    price: 120, 
    avatar: require('../../assets/images/professional-car-washer-omar.png') 
  },
  "3": { 
    name: "Hassan Berrada", 
    price: 150, 
    avatar: require('../../assets/images/professional-car-washer-hassan.png') 
  },
  "4": { 
    name: "Youssef Alami", 
    price: 60, 
    avatar: require('../../assets/images/professional-car-washer-youssef.png') 
  },
};

const carTypes = [
  { id: "sedan", name: "Sedan", multiplier: 1 },
  { id: "suv", name: "SUV", multiplier: 1.3 },
  { id: "hatchback", name: "Hatchback", multiplier: 0.9 },
  { id: "truck", name: "Truck", multiplier: 1.5 },
  { id: "van", name: "Van", multiplier: 1.4 },
];

const timeSlots = [
  { label: "09:00", value: "09:00" },
  { label: "09:30", value: "09:30" },
  { label: "10:00", value: "10:00" },
  { label: "10:30", value: "10:30" },
  { label: "11:00", value: "11:00" },
  { label: "11:30", value: "11:30" },
  { label: "12:00", value: "12:00" },
  { label: "12:30", value: "12:30" },
  { label: "13:00", value: "13:00" },
  { label: "13:30", value: "13:30" },
  { label: "14:00", value: "14:00" },
  { label: "14:30", value: "14:30" },
  { label: "15:00", value: "15:00" },
  { label: "15:30", value: "15:30" },
  { label: "16:00", value: "16:00" },
  { label: "16:30", value: "16:30" },
  { label: "17:00", value: "17:00" },
  { label: "17:30", value: "17:30" },
];

export default function BookingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { workerId = "1" } = (route.params as { workerId?: string }) || {};

  // Get today's date for min date input
  const today = new Date().toISOString().split("T")[0];

  // Helper: get nearest upcoming time slot from timeSlots
  const getNearestTimeSlot = () => {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    // timeSlots like '09:30'
    const mins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const next = timeSlots
      .map(s => s.value)
      .find(v => mins(v) >= current);
    return next || timeSlots[0].value;
  };

  const [formData, setFormData] = useState({
    location: "Current Location - Marrakech, Morocco",
    date: today,
    time: getNearestTimeSlot(),
    carType: 'sedan',
    notes: "",
    paymentMethod: "cash",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Build simple date options for next 30 days
  const dateOptions = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
    const label = `${weekday}, ${dd}/${mm}/${String(yyyy).slice(2)}`;
    return { value: iso, label };
  });

  const worker = mockWorkers[workerId as keyof typeof mockWorkers];
  const selectedCarType = carTypes.find((car) => car.id === formData.carType);
  const basePrice = worker?.price || 80;
  const finalPrice = selectedCarType ? Math.round(basePrice * selectedCarType.multiplier) : basePrice;

  const handleSubmit = () => {
    // Validate required fields with specific messages
    const missing: string[] = [];
    if (!formData.date) missing.push(t('date'));
    if (!formData.time) missing.push(t('time'));
    if (!formData.carType) missing.push(t('vehicle_type'));
    if (missing.length) {
      Alert.alert(t('missing_fields'), `${t('please_complete')}: ${missing.join(', ')}`);
      return;
    }

    // Ensure worker exists
    if (!worker) {
      Alert.alert(t('worker_not_found'), t('please_select_worker_again'));
      return;
    }

    // Navigate to confirmation page with booking data
    const bookingData = {
      workerId,
      workerName: worker?.name || 'Car Washer',
      ...formData,
      price: finalPrice.toString(),
    };

    navigation.navigate('BookingConfirmation', bookingData as any);
  };

  // today already computed above

  // Localized display for selected date (e.g., Thu, 21/08/25)
  const formattedDate = React.useMemo(() => {
    if (!formData.date) return '';
    const d = new Date(formData.date + 'T00:00:00');
    const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2);
    return `${weekday}, ${day}/${month}/${year}`;
  }, [formData.date]);

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}> 
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={theme.textSecondary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('confirm_booking')}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
          <Card style={{ padding: 20, width: '100%', maxWidth: 520, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 }}>{t('welcome_guest')}</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>{t('guest_prompt')}</Text>
            <Button onPress={() => (navigation as any).navigate('Login')}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t('sign_in')}</Text>
            </Button>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={theme.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Book Service</Text>
      </View>

      <ScrollView style={[styles.content]} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Selected Worker */}
        <Card style={styles.workerCard}>
          <View style={styles.workerInfo}>
            <Avatar 
              source={worker?.avatar} 
              name={worker?.name || ''} 
              size={48}
            />
            <View style={styles.workerDetails}>
              <Text style={[styles.workerName, { color: theme.textPrimary }]}>{worker?.name}</Text>
              <Text style={[styles.workerRole, { color: theme.textSecondary }]}>{t('your_car_washer')}</Text>
            </View>
            <Badge variant="secondary" style={styles.priceBadge}>
              {`${basePrice} MAD`}
            </Badge>
          </View>
        </Card>

        {/* Location */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={theme.accent} />
            <Label style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('service_location')}</Label>
          </View>
          <Input
            value={formData.location}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
            placeholder={t('enter_your_address')}
            style={styles.input}
          />
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            {t('the_worker_will_come_to_this_location_to_wash_your_car')}
          </Text>
        </Card>

        {/* Date & Time */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={theme.accent} />
            <Label style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('date_time')}</Label>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Label style={[styles.fieldLabel, { color: theme.textPrimary }]}>{t('date')} *</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateChips} contentContainerStyle={{ gap: 8 }}>
                {dateOptions.slice(0, 14).map((d) => {
                  const [weekday, rest] = d.label.split(',');
                  const selected = formData.date === d.value;
                  return (
                    <Pressable
                      key={d.value}
                      onPress={() => setFormData((prev) => ({ ...prev, date: d.value }))}
                      style={[
                        styles.dateChip,
                        { borderColor: theme.cardBorder, backgroundColor: theme.card },
                        selected && { borderColor: theme.accent, backgroundColor: theme.surface },
                      ]}
                    >
                      <Text style={[styles.dateChipWeekday, { color: selected ? theme.accent : theme.textSecondary }]}>{weekday?.trim()}</Text>
                      <Text style={[styles.dateChipDate, { color: theme.textPrimary }]}>{rest?.trim()}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.dateTimeItem}>
              <Label style={[styles.fieldLabel, { color: theme.textPrimary }]}>{t('time')} *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
                options={timeSlots}
                placeholder={t('select_time')}
                style={styles.select}
              />
            </View>
          </View>
        </Card>

        {/* Car Type */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Car size={20} color={theme.accent} />
            <Label style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('vehicle_type')}</Label>
          </View>

          <Select
            value={formData.carType}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, carType: value }))}
            options={carTypes.map((c) => ({ label: c.name, value: c.id }))}
            placeholder={t('select_vehicle_type')}
            style={styles.select}
            modalTitle={t('select_vehicle_type')}
            getOptionRightText={(opt) => {
              const c = carTypes.find((x) => x.id === opt.value);
              return c ? `${Math.round(basePrice * c.multiplier)} MAD` : undefined;
            }}
            getOptionSubtitle={(opt) => {
              const c = carTypes.find((x) => x.id === opt.value);
              return c && c.multiplier !== 1 ? `x${c.multiplier}` : undefined;
            }}
          />
        </Card>

        {/* Additional Notes */}
        <Card style={styles.sectionCard}>
          <Label style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('additional_notes')}</Label>
          <Textarea
            value={formData.notes}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
            placeholder={t('any_special_instructions_or_requests')}
            rows={3}
            style={styles.textarea}
          />
        </Card>

        {/* Payment Method */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={theme.accent} />
            <Label style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('payment_method')}</Label>
          </View>

          <View style={styles.paymentMethod}>
            <View style={[styles.paymentIndicator, { backgroundColor: theme.accent }]} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, { color: theme.textPrimary }]}>{t('cash_on_delivery')}</Text>
              <Text style={[styles.paymentDescription, { color: theme.textSecondary }] }>
                {t('to_be_paid_upon_completion')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Price Summary */}
        <Card style={[styles.priceCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Service Fee:</Text>
            <Text style={[styles.priceValue, { color: theme.textPrimary }]}>{basePrice} MAD</Text>
          </View>
          {selectedCarType && selectedCarType.multiplier !== 1 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceAdjustment, { color: theme.textSecondary }] }>
                {selectedCarType.name} adjustment:
              </Text>
              <Text style={[styles.priceAdjustment, { color: theme.textSecondary }]}>×{selectedCarType.multiplier}</Text>
            </View>
          )}
          <View style={[styles.priceDivider, { backgroundColor: theme.cardBorder }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: theme.accent }]}>{finalPrice} MAD</Text>
          </View>
        </Card>

      </ScrollView>

      {/* Date Picker Modal - Light theme unified style */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.uBackdrop} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.uCard} onPress={() => {}}>
            <Text style={styles.uTitle}>{t('select_date')}</Text>
            <ScrollView style={styles.uList} contentContainerStyle={{ paddingBottom: 8 }}>
              {dateOptions.map((d) => (
                <Pressable
                  key={d.value}
                  style={styles.uItem}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, date: d.value }));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.uItemTitle}>{d.label}</Text>
                  <Text style={styles.uItemSub}>{d.value}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button onPress={() => setShowDatePicker(false)}>
              <Text style={styles.submitButtonText}>{t('close')}</Text>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom fixed footer respecting safe area */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom - 12, 0), backgroundColor: theme.card, borderTopColor: theme.cardBorder }] }>
        <Button style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('confirm_booking')}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  workerCard: {
    padding: 16,
    marginBottom: 24,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  workerRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  priceBadge: {
    marginLeft: 'auto',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeItem: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  select: {
    marginTop: 6,
  },
  dateField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginTop: 6,
  },
  dateFieldText: {
    fontSize: 14,
    color: '#111827',
  },
  dateChips: {
    marginTop: 6,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  dateChipWeekday: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateChipDate: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  radioGroup: {
    gap: 8,
  },
  carTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  carTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carTypeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  carTypePrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  textarea: {
    marginTop: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  paymentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  paymentDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  priceCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#374151',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
  },
  priceAdjustment: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  submitButton: {
    height: 48,
    marginBottom: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modalList: {
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemDate: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  // Unified modal styles (light theme only)
  uBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  uCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  uTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  uList: {
    marginBottom: 12,
  },
  uItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  uItemTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  uItemSub: {
    fontSize: 12,
    color: '#6b7280',
  },
});
