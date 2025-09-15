import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { Star, MapPin, Clock, Phone, MessageCircle, Calendar } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import { Header } from '../components/ui/Header';
import { useThemeColors } from '../lib/theme';

// Mock worker data - matches original app structure
const mockWorkerData = {
  "1": {
    id: "1",
    name: "Ahmed Benali",
    rating: 4.8,
    reviewCount: 127,
    distance: "0.5 km",
    price: 80,
    avatar: require('../../assets/images/professional-car-washer-ahmed.png'),
    isAvailable: true,
    estimatedTime: "15 min",
    phone: "+212 6XX XXX XXX",
    experience: "3 years",
    completedJobs: 450,
    specialties: ["Exterior Wash", "Interior Cleaning", "Wax & Polish"],
    description: "Professional car washing service with attention to detail. I use eco-friendly products and ensure your car looks spotless.",
    reviews: [
      {
        id: 1,
        name: "Fatima K.",
        rating: 5,
        comment: "Excellent service! My car looks brand new.",
        date: "2 days ago",
      },
      {
        id: 2,
        name: "Mohammed A.",
        rating: 5,
        comment: "Very professional and punctual. Highly recommended!",
        date: "1 week ago",
      },
      { 
        id: 3, 
        name: "Aicha M.", 
        rating: 4, 
        comment: "Good work, fair price. Will book again.", 
        date: "2 weeks ago" 
      },
    ],
  },
  "2": {
    id: "2",
    name: "Omar Hassan",
    rating: 4.9,
    reviewCount: 203,
    distance: "0.8 km",
    price: 120,
    avatar: require('../../assets/images/professional-car-washer-omar.png'),
    isAvailable: true,
    estimatedTime: "20 min",
    phone: "+212 6XX XXX XXX",
    experience: "5 years",
    completedJobs: 680,
    specialties: ["Premium Wash", "Engine Cleaning", "Tire Shine"],
    description: "Specialized in premium car care services. I take pride in delivering exceptional results for every vehicle.",
    reviews: [
      { id: 1, name: "Hassan B.", rating: 5, comment: "Outstanding attention to detail!", date: "3 days ago" },
      { id: 2, name: "Laila S.", rating: 5, comment: "Best car wash service in Marrakech!", date: "1 week ago" },
    ],
  },
};

export default function WorkerDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { workerId } = route.params as { workerId: string };
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  const worker = mockWorkerData[workerId as keyof typeof mockWorkerData];

  if (!worker) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Worker not found</Text>
        <Button onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Button>
      </View>
    );
  }

  const handleBookNow = () => {
    navigation.navigate('Booking', { workerId });
  };

  const handleScheduleLater = () => {
    navigation.navigate('Booking', { workerId });
  };

  const handleCall = () => {
    Alert.alert('Call Worker', `Call ${worker.phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling...') }
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
        <Card style={styles.workerCard}>
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
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <Text style={[styles.rating, { color: theme.textPrimary }]}>{worker.rating}</Text>
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
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{worker.distance} away</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{worker.estimatedTime}</Text>
                </View>
              </View>
            </View>
          </View>

          <Separator style={styles.separator} />

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>{worker.completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>{worker.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>{worker.price} MAD</Text>
              <Text style={styles.statLabel}>Starting Price</Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>About</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{worker.description}</Text>
        </Card>

        {/* Specialties */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Specialties</Text>
          <View style={styles.specialtiesContainer}>
            {worker.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" style={styles.specialtyBadge}>
                {specialty}
              </Badge>
            ))}
          </View>
        </Card>

        {/* Reviews */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Reviews</Text>
          <View style={styles.reviewsContainer}>
            {worker.reviews.map((review) => (
              <View key={review.id} style={[styles.reviewItem, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={[styles.reviewerName, { color: theme.textPrimary }]}>{review.name}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < review.rating ? "#fbbf24" : theme.cardBorder}
                          fill={i < review.rating ? "#fbbf24" : "none"}
                        />
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

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { paddingBottom: Math.max(insets.bottom + 20, 44) }]}>
          <Button 
            style={[styles.bookButton, !worker.isAvailable && styles.disabledButton]} 
            disabled={!worker.isAvailable} 
            onPress={handleBookNow}
          >
            <Text style={styles.bookButtonText}>
              Book Now - {worker.price} MAD
            </Text>
          </Button>

          <View style={styles.secondaryButtons}>
            <Button variant="outline" style={styles.secondaryButton} onPress={handleScheduleLater}>
              <Calendar size={16} color={theme.accent} />
              <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Schedule Later</Text>
            </Button>
            <Button variant="outline" style={styles.secondaryButton} onPress={handleChat}>
              <MessageCircle size={16} color={theme.accent} />
              <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Chat</Text>
            </Button>
          </View>

          <Button variant="outline" style={styles.callButton} onPress={handleCall}>
            <Phone size={16} color={theme.accent} />
            <Text style={[styles.callButtonText, { color: theme.accent }]}>Call {worker.phone}</Text>
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
  workerCard: {
    padding: 24,
    marginBottom: 24,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workerNameContainer: {
    flex: 1,
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  workerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  separator: {
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionCard: {
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    marginBottom: 4,
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
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
    color: '#111827',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewComment: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  bookButton: {
    height: 48,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
  },
  callButtonText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});
