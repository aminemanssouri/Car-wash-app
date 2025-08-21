import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ArrowLeft, Calendar, MapPin, Phone, MessageCircle, MoreVertical, Star } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import { mockBookings, Booking } from '../data/bookings';
import { useNavigation } from '@react-navigation/native';

export const BookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
      case 'confirmed':
        return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' };
      case 'in-progress':
        return { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
      case 'completed':
        return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
      case 'cancelled':
        return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const filterBookings = (bookings: Booking[], filter: string) => {
    switch (filter) {
      case 'upcoming':
        return bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
      case 'active':
        return bookings.filter((b) => b.status === 'in-progress');
      case 'completed':
        return bookings.filter((b) => b.status === 'completed');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(mockBookings, activeTab);

  const handleBookingAction = (action: string, bookingId: string) => {
    switch (action) {
      case 'cancel':
        Alert.alert('Cancel Booking', `Cancel booking ${bookingId}?`);
        break;
      case 'reschedule':
        Alert.alert('Reschedule', `Reschedule booking ${bookingId}`);
        break;
      case 'rate':
        Alert.alert('Rate Service', `Rate booking ${bookingId}`);
        break;
      case 'contact':
        Alert.alert('Contact Worker', `Contact worker for booking ${bookingId}`);
        break;
    }
  };

  const TabButton = ({ label, value, isActive }: { label: string; value: string; isActive: boolean }) => (
    <Pressable
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={() => setActiveTab(value)}
    >
      <Text 
        style={[styles.tabText, isActive && styles.activeTabText]}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#374151" />
        </Button>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsList}>
          <TabButton label="All" value="all" isActive={activeTab === 'all'} />
          <TabButton label="Upcoming" value="upcoming" isActive={activeTab === 'upcoming'} />
          <TabButton label="Active" value="active" isActive={activeTab === 'active'} />
          <TabButton label="Completed" value="completed" isActive={activeTab === 'completed'} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' ? "You haven't made any bookings yet" : `No ${activeTab} bookings at the moment`}
            </Text>
            <Button onPress={() => navigation.navigate('Home' as never)} style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book a Service</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => {
              const statusStyle = getStatusColor(booking.status);
              return (
                <Card key={booking.id} style={styles.bookingCard}>
                  {/* Booking Header */}
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                      <View style={styles.bookingIdRow}>
                        <Text style={styles.bookingId}>#{booking.id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                          <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {getStatusText(booking.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.bookingDate}>Booked on {formatDate(booking.bookingDate)}</Text>
                    </View>
                    <Pressable style={styles.moreButton} onPress={() => Alert.alert('More Options', 'Booking options')}>
                      <MoreVertical size={16} color="#6b7280" />
                    </Pressable>
                  </View>

                  {/* Worker Info */}
                  <View style={styles.workerInfo}>
                    <Avatar
                      src={booking.workerAvatar}
                      size={48}
                      fallback={booking.workerName.split(' ').map(n => n[0]).join('')}
                    />
                    <View style={styles.workerDetails}>
                      <Text style={styles.workerName}>{booking.workerName}</Text>
                      <View style={styles.ratingRow}>
                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                        <Text style={styles.rating}>{booking.workerRating}</Text>
                      </View>
                    </View>
                    <View style={styles.priceInfo}>
                      <Text style={styles.price}>{booking.price} MAD</Text>
                      <Text style={styles.carType}>{booking.carType}</Text>
                    </View>
                  </View>

                  <Separator style={styles.separator} />

                  {/* Booking Details */}
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        {formatDate(booking.date)} at {booking.time}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{booking.location}</Text>
                    </View>

                    {booking.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>
                          <Text style={styles.notesLabel}>Notes: </Text>
                          {booking.notes}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  {(booking.status === 'confirmed' || booking.status === 'in-progress') && (
                    <View style={styles.actionButtons}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={styles.actionButton}
                        onPress={() => handleBookingAction('contact', booking.id)}
                      >
                        <Phone size={16} color="#374151" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        style={styles.actionButton}
                        onPress={() => handleBookingAction('contact', booking.id)}
                      >
                        <MessageCircle size={16} color="#374151" />
                        <Text style={styles.actionButtonText}>Chat</Text>
                      </Button>
                    </View>
                  )}

                  {booking.canRate && (
                    <Button
                      style={styles.rateButton}
                      onPress={() => handleBookingAction('rate', booking.id)}
                    >
                      <Star size={16} color="#ffffff" />
                      <Text style={styles.rateButtonText}>Rate Service</Text>
                    </Button>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookButton: {
    paddingHorizontal: 24,
  },
  bookButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  bookingsList: {
    padding: 16,
    gap: 16,
  },
  bookingCard: {
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  moreButton: {
    padding: 8,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 2,
  },
  carType: {
    fontSize: 14,
    color: '#6b7280',
  },
  separator: {
    marginBottom: 16,
  },
  bookingDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
  },
  notesLabel: {
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rateButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default BookingsScreen;
