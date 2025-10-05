import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { Calendar, Clock, MapPin, Phone, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Separator } from '../components/ui/Separator';
import { Header } from '../components/ui/Header';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';
import { bookingsService, BookingWithDetails } from '../services/bookings';

export const WorkerBookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useThemeColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  
  // Real data state
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load worker's bookings
  useEffect(() => {
    loadWorkerBookings();
  }, [user]);

  const loadWorkerBookings = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading worker bookings for user:', user.id);
      const workerBookings = await bookingsService.getUserBookings(user.id, 'worker');
      console.log('Loaded worker bookings:', workerBookings);
      
      setBookings(workerBookings);
    } catch (err) {
      console.error('Failed to load worker bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const mockBookings = {
    pending: [
      {
        id: '1',
        customerName: 'Ahmed Hassan',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Premium Wash & Wax',
        location: 'Gueliz, Marrakech',
        scheduledTime: '2024-01-15T10:00:00Z',
        price: 150,
        carType: 'Sedan',
      },
      {
        id: '2',
        customerName: 'Fatima Zahra',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Interior Deep Clean',
        location: 'Hivernage, Marrakech',
        scheduledTime: '2024-01-15T14:30:00Z',
        price: 120,
        carType: 'SUV',
      },
      {
        id: '5',
        customerName: 'Omar Benali',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Basic Wash',
        location: 'Medina, Marrakech',
        scheduledTime: '2024-01-15T16:00:00Z',
        price: 80,
        carType: 'Hatchback',
      },
    ],
    active: [
      {
        id: '3',
        customerName: 'Youssef Alami',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Basic Wash',
        location: 'Majorelle, Marrakech',
        scheduledTime: '2024-01-15T09:00:00Z',
        price: 80,
        carType: 'Hatchback',
        status: 'in_progress',
      },
    ],
    completed: [
      {
        id: '4',
        customerName: 'Laila Benali',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Premium Wash & Wax',
        location: 'Medina, Marrakech',
        completedTime: '2024-01-14T16:00:00Z',
        price: 150,
        carType: 'Sedan',
        rating: 5,
      },
      {
        id: '6',
        customerName: 'Rachid El Fassi',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Interior Deep Clean',
        location: 'Agdal, Marrakech',
        completedTime: '2024-01-14T11:30:00Z',
        price: 120,
        carType: 'SUV',
        rating: 4,
      },
      {
        id: '7',
        customerName: 'Aicha Moussaoui',
        customerPhone: '+212 6XX XXX XXX',
        service: 'Premium Wash & Wax',
        location: 'Gueliz, Marrakech',
        completedTime: '2024-01-13T15:45:00Z',
        price: 150,
        carType: 'Sedan',
        rating: 5,
      },
    ],
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await bookingsService.updateBookingStatus(bookingId, 'confirmed');
      Alert.alert('Success', 'Booking accepted successfully!');
      loadWorkerBookings(); // Reload bookings
    } catch (error) {
      console.error('Failed to accept booking:', error);
      Alert.alert('Error', 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await bookingsService.updateBookingStatus(bookingId, 'cancelled');
      Alert.alert('Notice', 'Booking rejected.');
      loadWorkerBookings(); // Reload bookings
    } catch (error) {
      console.error('Failed to reject booking:', error);
      Alert.alert('Error', 'Failed to reject booking');
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await bookingsService.updateBookingStatus(bookingId, 'completed');
      Alert.alert('Success', 'Booking marked as completed!');
      loadWorkerBookings(); // Reload bookings
    } catch (error) {
      console.error('Failed to complete booking:', error);
      Alert.alert('Error', 'Failed to complete booking');
    }
  };

  const handleStartBooking = async (bookingId: string) => {
    try {
      await bookingsService.updateBookingStatus(bookingId, 'in_progress');
      Alert.alert('Success', 'Booking started!');
      loadWorkerBookings(); // Reload bookings
    } catch (error) {
      console.error('Failed to start booking:', error);
      Alert.alert('Error', 'Failed to start booking');
    }
  };

  // Filter bookings by status
  const getFilteredBookings = () => {
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');
    const activeBookings = bookings.filter(booking => booking.status === 'in_progress' || booking.status === 'confirmed');
    const completedBookings = bookings.filter(booking => booking.status === 'completed');

    switch (activeTab) {
      case 'pending':
        return pendingBookings;
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      default:
        return [];
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const TabButton = ({ label, value, count }: { label: string; value: typeof activeTab; count: number }) => {
    const isActive = activeTab === value;
    
    return (
      <Pressable
        style={[
          styles.simpleTabButton,
          {
            backgroundColor: isActive ? theme.accent : 'transparent',
          }
        ]}
        onPress={() => setActiveTab(value)}
      >
        <Text 
          style={[
            styles.simpleTabText,
            { 
              color: isActive ? '#ffffff' : theme.textSecondary,
              fontWeight: isActive ? '600' : '500',
            }
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.8}
        >
          {label}
        </Text>
        {count > 0 && (
          <View style={[
            styles.simpleBadge,
            { 
              backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.accent,
            }
          ]}>
            <Text style={styles.simpleBadgeText}>
              {count}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const BookingCard = ({ booking, type }: { booking: BookingWithDetails; type: typeof activeTab }) => (
    <Card style={[styles.bookingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <Avatar
            size={44}
            fallback={booking.customerName.split(' ').map((n: string) => n[0]).join('')}
          />
          <View style={styles.customerDetails}>
            <Text style={[styles.customerName, { color: theme.textPrimary }]}>{booking.customerName}</Text>
            <Text style={[styles.serviceType, { color: theme.textSecondary }]}>{booking.serviceName}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.accent }]}>{booking.total_price} MAD</Text>
          {type === 'pending' && (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}
          {type === 'active' && (
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          )}
        </View>
      </View>

      <Separator style={[styles.bookingSeparator, { backgroundColor: theme.cardBorder }]} />

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MapPin size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>{booking.service_address_text}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {type === 'completed' 
              ? `Completed ${formatDate(booking.completed_at || '')} at ${formatTime(booking.completed_at || '')}`
              : `${formatDate(booking.scheduled_date)} at ${formatTime(booking.scheduled_time)}`
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Phone size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>Contact Customer</Text>
        </View>

        {type === 'completed' && booking.workerRating && (
          <View style={styles.detailRow}>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={[styles.star, { color: i < booking.workerRating ? '#fbbf24' : '#e5e7eb' }]}>★</Text>
              ))}
            </View>
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              Customer rating: {booking.workerRating}/5
            </Text>
          </View>
        )}
      </View>

      {type === 'pending' && (
        <View style={styles.bookingActions}>
          <Button
            variant="outline"
            onPress={() => handleRejectBooking(booking.id)}
            style={[styles.actionButton, styles.rejectButton]}
          >
            <XCircle size={16} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Reject</Text>
          </Button>
          <Button
            onPress={() => handleAcceptBooking(booking.id)}
            style={[styles.actionButton, styles.acceptButton]}
          >
            <CheckCircle size={16} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Accept</Text>
          </Button>
        </View>
      )}

      {type === 'active' && (
        <View style={styles.bookingActions}>
          <Button
            onPress={() => handleCompleteBooking(booking.id)}
            style={[styles.actionButton, styles.completeButton]}
          >
            <CheckCircle size={16} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Mark Complete</Text>
          </Button>
        </View>
      )}
    </Card>
  );



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={[]}>
      <Header 
        title="My Bookings" 
        onBack={() => navigation.goBack()} 
      />

      <View style={styles.content}>
        {/* Stats Summary */}
        <View style={[styles.statsContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.accent }]}>
              {bookings.filter(b => b.status === 'pending').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>
              {bookings.filter(b => b.status === 'in_progress' || b.status === 'confirmed').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {bookings.filter(b => b.status === 'completed').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
          </View>
        </View>

        {/* Simple Tabs */}
        <View style={styles.simpleTabsContainer}>
          <TabButton 
            label="Pending" 
            value="pending" 
            count={bookings.filter(b => b.status === 'pending').length} 
          />
          <TabButton 
            label="Active" 
            value="active" 
            count={bookings.filter(b => b.status === 'in_progress' || b.status === 'confirmed').length} 
          />
          <TabButton 
            label="Completed" 
            value="completed" 
            count={bookings.filter(b => b.status === 'completed').length} 
          />
        </View>

        {/* Booking List */}
        <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading bookings...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={48} color="#ef4444" />
              <Text style={[styles.errorText, { color: theme.textPrimary }]}>
                {error}
              </Text>
              <Button
                onPress={loadWorkerBookings}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Button>
            </View>
          ) : getFilteredBookings().length > 0 ? (
            getFilteredBookings().map((booking) => (
              <BookingCard key={booking.id} booking={booking} type={activeTab} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No {activeTab} bookings
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                {activeTab === 'pending' && 'New booking requests will appear here'}
                {activeTab === 'active' && 'Accepted bookings will show here'}
                {activeTab === 'completed' && 'Your completed jobs will be listed here'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Simple Tabs
  simpleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  simpleTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    minHeight: 40,
  },
  simpleTabText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    flexShrink: 1,
    includeFontPadding: false,
  },
  simpleBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Bookings List
  bookingsList: {
    flex: 1,
  },
  bookingCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  bookingSeparator: {
    marginVertical: 16,
    height: 1,
  },
  bookingDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    borderColor: '#ef4444',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkerBookingsScreen;
