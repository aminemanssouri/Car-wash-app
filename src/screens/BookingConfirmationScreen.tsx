import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { CheckCircle, MapPin, Calendar, Car, CreditCard, Home } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';

export default function BookingConfirmationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // Get booking data from route params with safe defaults
  const bookingData = ({
    workerId: '',
    workerName: 'Car Washer',
    location: 'Marrakech, Morocco',
    date: '',
    time: '',
    carType: 'sedan',
    notes: '',
    price: '0',
    ...(route.params as any || {}),
  });

  // Generate booking ID
  const bookingId = `CW${Date.now().toString().slice(-6)}`;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get car type display name
  const getCarTypeName = (carType: string) => {
    const types: { [key: string]: string } = {
      sedan: "Sedan",
      suv: "SUV",
      hatchback: "Hatchback",
      truck: "Truck",
      van: "Van",
    };
    return types[carType] || carType;
  };

  const handleGoHome = () => {
    (navigation as any).navigate('MainTabs', { screen: 'Home' });
  };

  const handleViewBookings = () => {
    (navigation as any).navigate('MainTabs', { screen: 'Bookings' });
  };

  const getWorkerAvatar = (workerName?: string) => {
    if (!workerName || typeof workerName !== 'string') return null;
    const firstName = workerName.toLowerCase().split(" ")[0];
    try {
      switch (firstName) {
        case 'ahmed':
          return require('../../assets/images/professional-car-washer-ahmed.png');
        case 'omar':
          return require('../../assets/images/professional-car-washer-omar.png');
        case 'hassan':
          return require('../../assets/images/professional-car-washer-hassan.png');
        case 'youssef':
          return require('../../assets/images/professional-car-washer-youssef.png');
        default:
          return null;
      }
    } catch {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <CheckCircle size={32} color="#16a34a" />
          </View>
          <View style={styles.successText}>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>Your car wash service has been scheduled</Text>
          </View>
        </View>

        {/* Booking ID */}
        <Card style={styles.bookingIdCard}>
          <Text style={styles.bookingIdLabel}>Booking ID</Text>
          <Text style={styles.bookingIdValue}>{bookingId}</Text>
        </Card>

        {/* Worker Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Car Washer</Text>
          <View style={styles.workerInfo}>
            <Avatar 
              source={getWorkerAvatar(bookingData.workerName)} 
              name={bookingData.workerName} 
              size={48}
            />
            <View style={styles.workerDetails}>
              <Text style={styles.workerName}>{bookingData.workerName}</Text>
              <Text style={styles.workerRole}>Professional Car Washer</Text>
            </View>
            <Badge variant="default">Confirmed</Badge>
          </View>
        </Card>

        {/* Booking Details */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailsContainer}>
            {/* Location */}
            <View style={styles.detailItem}>
              <MapPin size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Service Location</Text>
                <Text style={styles.detailValue}>{bookingData.location}</Text>
              </View>
            </View>

            <Separator style={styles.detailSeparator} />

            {/* Date & Time */}
            <View style={styles.detailItem}>
              <Calendar size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatDate(bookingData.date)} at {bookingData.time}
                </Text>
              </View>
            </View>

            <Separator style={styles.detailSeparator} />

            {/* Vehicle Type */}
            <View style={styles.detailItem}>
              <Car size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Vehicle Type</Text>
                <Text style={styles.detailValue}>{getCarTypeName(bookingData.carType)}</Text>
              </View>
            </View>

            <Separator style={styles.detailSeparator} />

            {/* Payment */}
            <View style={styles.detailItem}>
              <CreditCard size={20} color="#6b7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>Cash on Delivery</Text>
              </View>
            </View>

            {/* Notes */}
            {bookingData.notes && (
              <>
                <Separator style={styles.detailSeparator} />
                <View style={styles.notesSection}>
                  <Text style={styles.detailLabel}>Additional Notes</Text>
                  <Text style={styles.detailValue}>{bookingData.notes}</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Price Summary */}
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.priceValue}>{bookingData.price} MAD</Text>
          </View>
          <Text style={styles.priceNote}>To be paid upon service completion</Text>
        </Card>

        {/* Important Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• The worker will arrive at your location 5-10 minutes before the scheduled time</Text>
            <Text style={styles.infoItem}>• Please ensure water access is available at the service location</Text>
            <Text style={styles.infoItem}>• Payment is due upon completion of the service</Text>
            <Text style={styles.infoItem}>• You can contact the worker directly if needed</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Button style={styles.primaryButton} onPress={handleViewBookings}>
            <Text style={styles.primaryButtonText}>View My Bookings</Text>
          </Button>
          <Button variant="outline" style={styles.secondaryButton} onPress={handleGoHome}>
            <Home size={16} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  bookingIdCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookingIdValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 4,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
    fontWeight: '500',
    color: '#111827',
  },
  workerRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  detailValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  detailSeparator: {
    marginVertical: 0,
  },
  notesSection: {
    marginTop: 16,
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
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  priceNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  primaryButton: {
    height: 48,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#3b82f6',
  },
});
