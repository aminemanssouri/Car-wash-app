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
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';

export const BookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');
  const theme = useThemeColors();
  const { t } = useLanguage();

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: theme.isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7', color: theme.isDark ? '#fde68a' : '#92400e', borderColor: theme.isDark ? 'rgba(251, 191, 36, 0.25)' : '#fde68a' };
      case 'confirmed':
        return { backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', color: theme.isDark ? '#93c5fd' : '#1e40af', borderColor: theme.isDark ? 'rgba(59,130,246,0.35)' : '#93c5fd' };
      case 'in-progress':
        return { backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.18)' : '#d1fae5', color: theme.isDark ? '#6ee7b7' : '#065f46', borderColor: theme.isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0' };
      case 'completed':
        return { backgroundColor: theme.isDark ? 'rgba(148,163,184,0.12)' : '#f3f4f6', color: theme.textPrimary, borderColor: theme.isDark ? 'rgba(148,163,184,0.25)' : '#d1d5db' };
      case 'cancelled':
        return { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', color: theme.isDark ? '#fca5a5' : '#991b1b', borderColor: theme.isDark ? 'rgba(239,68,68,0.35)' : '#fca5a5' };
      default:
        return { backgroundColor: theme.isDark ? 'rgba(148,163,184,0.12)' : '#f3f4f6', color: theme.textPrimary, borderColor: theme.isDark ? 'rgba(148,163,184,0.25)' : '#d1d5db' };
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return t('status_pending');
      case 'confirmed':
        return t('status_confirmed');
      case 'in-progress':
        return t('status_in_progress');
      case 'completed':
        return t('status_completed');
      case 'cancelled':
        return t('status_cancelled');
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
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Button>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('my_bookings')}</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={[styles.tabsList, { backgroundColor: theme.isDark ? 'rgba(148,163,184,0.12)' : '#f3f4f6' }]}>
          <TabButton label={t('tab_all')} value="all" isActive={activeTab === 'all'} />
          <TabButton label={t('tab_upcoming')} value="upcoming" isActive={activeTab === 'upcoming'} />
          <TabButton label={t('tab_active')} value="active" isActive={activeTab === 'active'} />
          <TabButton label={t('tab_completed')} value="completed" isActive={activeTab === 'completed'} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{t('no_bookings_found')}</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }] }>
              {activeTab === 'all' ? t('no_bookings_yet') : t('no_status_bookings').replace('{status}', t(`tab_${activeTab}` as any))}
            </Text>
            <Button onPress={() => navigation.navigate('Home' as never)} style={styles.bookButton}>
              <Text style={styles.bookButtonText}>{t('book_a_service')}</Text>
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
                        <Text style={[styles.bookingId, { color: theme.textPrimary }]}>#{booking.id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                          <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {getStatusText(booking.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.bookingDate, { color: theme.textSecondary }]}>{t('booked_on')} {formatDate(booking.bookingDate)}</Text>
                    </View>
                    <Pressable style={styles.moreButton} onPress={() => Alert.alert('More Options', 'Booking options')}>
                      <MoreVertical size={16} color={theme.textSecondary} />
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
                      <Text style={[styles.workerName, { color: theme.textPrimary }]}>{booking.workerName}</Text>
                      <View style={styles.ratingRow}>
                        <Star size={12} color={theme.isDark ? '#fbbf24' : '#fbbf24'} fill={theme.isDark ? '#fbbf24' : '#fbbf24'} />
                        <Text style={[styles.rating, { color: theme.textSecondary }]}>{booking.workerRating}</Text>
                      </View>
                    </View>
                    <View style={styles.priceInfo}>
                      <Text style={[styles.price, { color: theme.accent }]}>{booking.price} MAD</Text>
                      <Text style={[styles.carType, { color: theme.textSecondary }]}>{booking.carType}</Text>
                    </View>
                  </View>

                  <Separator style={styles.separator} />

                  {/* Booking Details */}
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color={theme.textSecondary} />
                      <Text style={[styles.detailText, { color: theme.textPrimary }]}>
                        {formatDate(booking.date)} at {booking.time}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MapPin size={16} color={theme.textSecondary} />
                      <Text style={[styles.detailText, { color: theme.textPrimary }]}>{booking.location}</Text>
                    </View>

                    {booking.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={[styles.notesText, { color: theme.textPrimary }]}>
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
                        <Phone size={16} color={theme.textPrimary} />
                        <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>{t('call')}</Text>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        style={styles.actionButton}
                        onPress={() => handleBookingAction('contact', booking.id)}
                      >
                        <MessageCircle size={16} color={theme.textPrimary} />
                        <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>{t('chat')}</Text>
                      </Button>
                    </View>
                  )}

                  {booking.canRate && (
                    <Button
                      style={styles.rateButton}
                      onPress={() => handleBookingAction('rate', booking.id)}
                    >
                      <Star size={16} color="#ffffff" />
                      <Text style={styles.rateButtonText}>{t('rate_service')}</Text>
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
