import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Alert, 
  Platform, 
  Linking, 
  ActivityIndicator 
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { Calendar, Clock, MapPin, Star, Phone, MessageCircle, ChevronLeft, Check } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Separator } from '../components/ui/Separator';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { BookingFooter } from '../components/ui/BookingFooter';
import { Separator } from '../components/ui/Separator';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';

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
    phone: "+212662093333",
    experience: "3",
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
  const route = useRoute<RouteProp<RootStackParamList, 'WorkerDetail'>>();
  const { workerId } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { t, language } = useLanguage();

  const worker = mockWorkerData[workerId as keyof typeof mockWorkerData];

  if (!worker) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('worker_not_found')}</Text>
        <Button onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t('go_back')}</Text>
        </Button>
      </View>
    );
  }

  const handleBookNow = () => {
    navigation.navigate('Booking', { workerId });
  };


  const handleCall = async () => {
    const phoneNumber = worker.phone.replace(/\s+/g, ''); // Remove spaces
    const phoneUrl = `tel:${phoneNumber}`;
    
    try {
      // Try to open the phone dialer directly
      await Linking.openURL(phoneUrl);
    } catch (error) {
      console.error('Error making phone call:', error);
      // If tel: doesn't work, try alternative approaches
      try {
        // Try with different phone URL formats
        const alternativeUrl = Platform.OS === 'ios' 
          ? `telprompt:${phoneNumber}` 
          : `tel:${phoneNumber}`;
        await Linking.openURL(alternativeUrl);
      } catch (secondError) {
        console.error('Alternative phone call failed:', secondError);
        Alert.alert(
          t('error') || 'Error', 
          `${t('call_failed') || 'Failed to make phone call'}. ${t('copy_number') || 'Please copy the number manually'}: ${worker.phone}`
        );
      }
    }
  };

  const handleChat = () => {
    navigation.navigate('ComingSoon', { feature: 'Messaging' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header 
        title={t('worker_profile')} 
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
                      <Text style={[styles.rating, { color: theme.textPrimary }]}>{worker.rating}</Text>
                      <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>({worker.reviewCount} {language === 'fr' ? 'avis' : 'reviews'})</Text>
                    </View>
                  </View>
                </View>
                <Badge variant={worker.isAvailable ? "default" : "secondary"}>
                  {worker.isAvailable ? (language === 'fr' ? 'Disponible' : 'Available') : (language === 'fr' ? 'Occupé' : 'Busy')}
                </Badge>
              </View>

              <View style={styles.workerStats}>
                <View style={styles.statItem}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{worker.distance} {language === 'fr' ? 'de distance' : 'away'}</Text>
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
            <View style={styles.statCard}>
              <Text 
                style={[styles.statNumber, { color: theme.accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {worker.completedJobs}
              </Text>
              <Text 
                style={[styles.statLabel, { color: theme.textSecondary }]} 
                numberOfLines={2} 
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {t('jobs_done')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text 
                style={[styles.statNumber, { color: theme.accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {worker.experience}
              </Text>
              <Text 
                style={[styles.statLabel, { color: theme.textSecondary }]} 
                numberOfLines={2} 
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {t('experience')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text 
                style={[styles.statNumber, { color: theme.accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {worker.price}
              </Text>
              <Text 
                style={[styles.statLabel, { color: theme.textSecondary }]} 
                numberOfLines={2} 
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {t('starting_price')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('about_worker').replace(' {name}', '')}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{worker.description}</Text>
        </Card>

        {/* Specialties */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('services_offered')}</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('reviews_and_ratings')}</Text>
          <View style={styles.reviewsContainer}>
            {worker.reviews.map((review) => (
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
        <View style={styles.actionButtons}>
          <Button variant="outline" style={styles.callButton} onPress={handleChat}>
            <MessageCircle size={16} color={theme.accent} />
            <Text style={[styles.callButtonText, { color: theme.accent }]}>{t('chat')}</Text>
          </Button>

          <Button variant="outline" style={styles.callButton} onPress={handleCall}>
            <Phone size={16} color={theme.accent} />
            <Text style={[styles.callButtonText, { color: theme.accent }]}>{t('call')} {worker.phone}</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Footer */}
      <BookingFooter
        onContinue={handleBookNow}
        continueText={`${t('book_now')} - ${worker.price} MAD`}
        continueDisabled={!worker.isAvailable}
        showBackButton={false}
      />

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
    gap: 4,
    flexWrap: 'wrap',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
    flexShrink: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    minHeight: 85,
    justifyContent: 'center',
    maxWidth: '33%',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '500',
    flexWrap: 'wrap',
    width: '100%',
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
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.5,
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
    textAlign: 'center',
    flexShrink: 1,
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