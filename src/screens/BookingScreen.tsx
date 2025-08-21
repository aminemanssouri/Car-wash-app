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
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

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
    if (!formData.date) missing.push('Date');
    if (!formData.time) missing.push('Time');
    if (!formData.carType) missing.push('Vehicle Type');
    if (missing.length) {
      Alert.alert('Missing fields', `Please complete: ${missing.join(', ')}`);
      return;
    }

    // Ensure worker exists
    if (!worker) {
      Alert.alert('Worker not found', 'Please go back and select a worker again.');
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Book Service</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Selected Worker */}
        <Card style={styles.workerCard}>
          <View style={styles.workerInfo}>
            <Avatar 
              source={worker?.avatar} 
              name={worker?.name || ''} 
              size={48}
            />
            <View style={styles.workerDetails}>
              <Text style={styles.workerName}>{worker?.name}</Text>
              <Text style={styles.workerRole}>Selected Car Washer</Text>
            </View>
            <Badge variant="secondary" style={styles.priceBadge}>
              Starting at {basePrice} MAD
            </Badge>
          </View>
        </Card>

        {/* Location */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#3b82f6" />
            <Label style={styles.sectionTitle}>Service Location</Label>
          </View>
          <Input
            value={formData.location}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
            placeholder="Enter your address"
            style={styles.input}
          />
          <Text style={styles.helperText}>
            The worker will come to this location to wash your car
          </Text>
        </Card>

        {/* Date & Time */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#3b82f6" />
            <Label style={styles.sectionTitle}>Date & Time</Label>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Label style={styles.fieldLabel}>Date *</Label>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateField}>
                <Text style={[styles.dateFieldText, !formData.date && { color: '#9ca3af' }]}>
                  {formattedDate || 'Select a date'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.dateTimeItem}>
              <Label style={styles.fieldLabel}>Time *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
                options={timeSlots}
                placeholder="Select time"
                style={styles.select}
              />
            </View>
          </View>
        </Card>

        {/* Car Type */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Car size={20} color="#3b82f6" />
            <Label style={styles.sectionTitle}>Vehicle Type *</Label>
          </View>

          <RadioGroup
            value={formData.carType}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, carType: value }))}
            style={styles.radioGroup}
          >
            {carTypes.map((car) => (
              <Pressable
                key={car.id}
                onPress={() => setFormData((prev) => ({ ...prev, carType: car.id }))}
                style={[
                  styles.carTypeOption,
                  formData.carType === car.id && { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
                ]}
              >
                <View style={styles.carTypeLeft}>
                  <RadioGroupItem value={car.id} id={car.id} />
                  <Text style={styles.carTypeName}>{car.name}</Text>
                </View>
                <Text style={styles.carTypePrice}>
                  {Math.round(basePrice * car.multiplier)} MAD
                </Text>
              </Pressable>
            ))}
          </RadioGroup>
        </Card>

        {/* Additional Notes */}
        <Card style={styles.sectionCard}>
          <Label style={styles.sectionTitle}>Additional Notes (Optional)</Label>
          <Textarea
            value={formData.notes}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
            placeholder="Any special instructions or requests..."
            rows={3}
            style={styles.textarea}
          />
        </Card>

        {/* Payment Method */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#3b82f6" />
            <Label style={styles.sectionTitle}>Payment Method</Label>
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.paymentIndicator} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentDescription}>
                Pay the worker directly after service completion
              </Text>
            </View>
          </View>
        </Card>

        {/* Price Summary */}
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee:</Text>
            <Text style={styles.priceValue}>{basePrice} MAD</Text>
          </View>
          {selectedCarType && selectedCarType.multiplier !== 1 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceAdjustment}>
                {selectedCarType.name} adjustment:
              </Text>
              <Text style={styles.priceAdjustment}>×{selectedCarType.multiplier}</Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{finalPrice} MAD</Text>
          </View>
        </Card>

      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select a date</Text>
            <ScrollView style={styles.modalList} contentContainerStyle={{ paddingBottom: 8 }}>
              {dateOptions.map((d) => (
                <Pressable
                  key={d.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, date: d.value }));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.modalItemDate}>{d.label}</Text>
                  <Text style={{ color: '#6b7280' }}>{d.value}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button onPress={() => setShowDatePicker(false)}>
              <Text style={styles.submitButtonText}>Close</Text>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom fixed footer respecting safe area */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }] }>
        <Button style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Confirm Booking</Text>
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
    paddingTop: 20,
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
    marginBottom: 24,
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
});
