import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { ArrowLeft, Calendar, DollarSign, Star, Clock, MapPin, Phone, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Separator } from '../components/ui/Separator';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';

export const WorkerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useThemeColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');

  // Mock data - in a real app, this would come from the backend
  const stats = {
    todayEarnings: 450,
    weeklyEarnings: 2100,
    rating: 4.8,
    completedJobs: 127,
    pendingBookings: 3,
    activeBookings: 1,
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
    ],
  };

  const handleAcceptBooking = (bookingId: string) => {
    Alert.alert(
      'Accept Booking',
      'Are you sure you want to accept this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => Alert.alert('Success', 'Booking accepted!') }
      ]
    );
  };

  const handleRejectBooking = (bookingId: string) => {
    Alert.alert(
      'Reject Booking',
      'Are you sure you want to reject this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => Alert.alert('Rejected', 'Booking rejected.') }
      ]
    );
  };

  const handleCompleteBooking = (bookingId: string) => {
    Alert.alert(
      'Complete Booking',
      'Mark this booking as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => Alert.alert('Success', 'Booking completed!') }
      ]
    );
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

  const TabButton = ({ label, value, count }: { label: string; value: typeof activeTab; count: number }) => (
    <View style={styles.tabButtonContainer}>
      {count > 0 && (
        <View style={[styles.notificationBubble, { backgroundColor: theme.accent }]}>
          <Text style={styles.bubbleText}>{count}</Text>
        </View>
      )}
      <Button
        variant={activeTab === value ? 'default' : 'ghost'}
        onPress={() => setActiveTab(value)}
        style={[
          styles.tabButton,
          activeTab === value && { backgroundColor: theme.accent }
        ]}
      >
        <Text style={[
          styles.tabButtonText,
          { color: activeTab === value ? '#ffffff' : theme.textPrimary },
          activeTab !== value && { color: theme.textSecondary }
        ]}>
          {label}
        </Text>
      </Button>
    </View>
  );

  const BookingCard = ({ booking, type }: { booking: any; type: typeof activeTab }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <Avatar
            size={40}
            fallback={booking.customerName.split(' ').map((n: string) => n[0]).join('')}
          />
          <View style={styles.customerDetails}>
            <Text style={[styles.customerName, { color: theme.textPrimary }]}>{booking.customerName}</Text>
            <Text style={[styles.serviceType, { color: theme.textSecondary }]}>{booking.service}</Text>
          </View>
        </View>
        <Text style={[styles.price, { color: theme.accent }]}>{booking.price} MAD</Text>
      </View>

      <Separator style={styles.bookingSeparator} />

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MapPin size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>{booking.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {type === 'completed' 
              ? `Completed ${formatDate(booking.completedTime)} at ${formatTime(booking.completedTime)}`
              : `${formatDate(booking.scheduledTime)} at ${formatTime(booking.scheduledTime)}`
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Phone size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>{booking.customerPhone}</Text>
        </View>

        {type === 'completed' && booking.rating && (
          <View style={styles.detailRow}>
            <Star size={16} color={theme.accent} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              Customer rated {booking.rating}/5 stars
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Worker Dashboard</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>
            Welcome back, {user?.profile?.full_name || 'Worker'}!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: theme.textSecondary }]}>
            Here's your dashboard overview
          </Text>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <DollarSign size={24} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.todayEarnings} MAD</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today's Earnings</Text>
          </Card>

          <Card style={styles.statCard}>
            <Calendar size={24} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.weeklyEarnings} MAD</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>This Week</Text>
          </Card>

          <Card style={styles.statCard}>
            <Star size={24} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.rating}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rating</Text>
          </Card>

          <Card style={styles.statCard}>
            <CheckCircle size={24} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.completedJobs}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Jobs Done</Text>
          </Card>
        </View>

        {/* Bookings Section */}
        <Card style={styles.bookingsCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Bookings</Text>
          
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TabButton label="Pending" value="pending" count={mockBookings.pending.length} />
            <TabButton label="Active" value="active" count={mockBookings.active.length} />
            <TabButton label="Completed" value="completed" count={mockBookings.completed.length} />
          </View>

          {/* Booking List */}
          <View style={styles.bookingsList}>
            {mockBookings[activeTab].length > 0 ? (
              mockBookings[activeTab].map((booking) => (
                <BookingCard key={booking.id} booking={booking} type={activeTab} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <AlertCircle size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No {activeTab} bookings
                </Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    maxWidth: '48%',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  bookingsCard: {
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  tabButtonContainer: {
    flex: 1,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    height: 44,
    minWidth: 80,
  },
  notificationBubble: {
    position: 'absolute',
    top: -6,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bubbleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    padding: 16,
    marginHorizontal: 2,
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
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingSeparator: {
    marginVertical: 12,
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
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
    height: 40,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WorkerDashboardScreen;
