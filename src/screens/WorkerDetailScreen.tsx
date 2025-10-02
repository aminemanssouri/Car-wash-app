import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Calendar
} from 'lucide-react-native';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import { useThemeColors } from '../lib/theme';
import { workersService } from '../services';
import type { Worker } from '../services/workers';

// Mock reviews data - would come from database in production
const mockReviews = [
  {
    id: 1,
    name: "Fatima K.",
    rating: 5,
    comment: "Excellent service! My car looks brand new.",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Mohammed A.",
    rating: 5,
    comment: "Very professional and punctual. Highly recommended!",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Aicha M.",
    rating: 4,
    comment: "Good work, fair price. Will book again.",
    date: "2 weeks ago"
  }
];

export default function WorkerDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'WorkerDetail'>>();
  const { workerId } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load worker data
  useEffect(() => {
    loadWorkerData();
  }, [workerId]);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const workerData = await workersService.getWorkerById(workerId);
      
      if (!workerData) {
        setError('Worker not found');
        return;
      }
      
      setWorker(workerData);
    } catch (err: any) {
      console.error('Error loading worker details:', err);
      setError(err.message || 'Failed to load worker details');
      Alert.alert(
        'Error Loading Worker',
        err.message || 'Failed to load worker details. Please try again.',
        [
          { text: 'Retry', onPress: loadWorkerData },
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
        <Header title="Worker Details" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading worker details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !worker) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
        <Header title="Worker Details" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>{error || 'Worker not found'}</Text>
          <Button onPress={loadWorkerData} style={{ marginBottom: 8 }}>Retry</Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookNow = () => {
    navigation.navigate('Booking', { workerId });
  };

  const handleScheduleLater = () => {
    navigation.navigate('Booking', { workerId });
  };

  const handleCall = () => {
    Alert.alert('Call Worker', `Call ${worker.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling worker...') }
    ]);
  };

  const handleChat = () => {
    navigation.navigate('ComingSoon', { feature: 'Messaging' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header 
        title="Worker Profile" 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Worker Info Card */}
        <Card style={[styles.workerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.workerHeader}>
            <Avatar 
              source={worker.avatar} 
              name={worker.name} 
              size={80} 
            />
            
            <View style={styles.workerInfo}>
              <View style={styles.workerNameRow}>
                <View style={styles.workerNameContainer}>
                  <Text style={[styles.workerName, { color: theme.textPrimary }]}>{worker.name}</Text>
                  {worker.businessName && (
                    <Text style={[styles.businessName, { color: theme.textSecondary }]}>{worker.businessName}</Text>
                  )}
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <Text style={[styles.rating, { color: theme.textPrimary }]}>{worker.rating.toFixed(1)}</Text>
                      <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>({worker.reviewCount} reviews)</Text>
                    </View>
                  </View>
                </View>
                <Badge variant={worker.isAvailable ? "default" : "secondary"}>
                  {worker.isAvailable ? "Available" : "Busy"}
                </Badge>
              </View>

              <View style={styles.workerStats}>
                <View style={styles.statItem}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {worker.distanceKm !== undefined ? `${worker.distanceKm.toFixed(1)} km away` : 'Location available'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {`${worker.startTime} - ${worker.endTime}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Separator style={styles.separator} />

          <View style={styles.statsGrid}>
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>{worker.totalJobsCompleted}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Jobs</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>
                {worker.experienceYears ? `${worker.experienceYears}` : '0'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Years</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>{worker.price}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>MAD</Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={[styles.descriptionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>About</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {worker.bio || 'Professional car washing service provider with attention to detail and years of experience.'}
          </Text>

          {/* Services */}
          {(worker.specialties || worker.services)?.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 20 }]}>Services</Text>
              <View style={styles.specialtiesContainer}>
                {(worker.specialties || worker.services || []).map((specialty, index) => (
                  <Badge key={index} variant="secondary" style={styles.specialtyBadge}>
                    {specialty}
                  </Badge>
                ))}
              </View>
            </>
          )}
        </Card>

        {/* Reviews */}
        <Card style={[styles.reviewsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Reviews</Text>
          <View style={styles.reviewsList}>
            {mockReviews.map((review) => (
              <View key={review.id} style={[styles.reviewItem, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={[styles.reviewerName, { color: theme.textPrimary }]}>{review.name}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>{review.date}</Text>
                </View>
                <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.bg, borderTopColor: theme.cardBorder }]}>
        <Button 
          style={[styles.bookButton, { opacity: worker.isAvailable ? 1 : 0.5 }]}
          onPress={handleBookNow}
          disabled={!worker.isAvailable}
        >
          Book Now - {worker.price} MAD
        </Button>
        
        <View style={styles.secondaryButtons}>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: theme.surface }]}
            onPress={handleCall}
          >
            <Phone size={20} color={theme.accent} />
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Call</Text>
          </Pressable>
          
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: theme.surface }]}
            onPress={handleChat}
          >
            <MessageCircle size={20} color={theme.accent} />
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Message</Text>
          </Pressable>
          
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: theme.surface }]}
            onPress={handleScheduleLater}
          >
            <Calendar size={20} color={theme.accent} />
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Schedule</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  workerCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  workerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workerNameContainer: {
    flex: 1,
  },
  workerName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  businessName: {
    fontSize: 14,
    marginTop: 2,
  },
  ratingRow: {
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 14,
    marginLeft: 4,
  },
  workerStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  separator: {
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  descriptionCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    marginBottom: 8,
  },
  reviewsCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  bookButton: {
    height: 48,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});