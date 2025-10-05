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
import { Star, MapPin, Clock, Phone, MessageCircle } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import { Header } from '../components/ui/Header';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { workersService, type Worker } from '../services/workers';

export default function WorkerDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'WorkerDetail'>>();
  const { workerId } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { t, language } = useLanguage();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  


  useEffect(() => {
    loadWorkerData();
  }, [workerId]);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const workerData = await workersService.getWorkerById(workerId);
      if (workerData) {
        setWorker(workerData);
      } else {
        setError(t('worker_not_found'));
      }
    } catch (err) {
      console.error('Error loading worker:', err);
      setError(t('error_loading_worker') || 'Failed to load worker details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Header 
          title={t('worker_profile')} 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            {t('loading')}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !worker) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Header 
          title={t('worker_profile')} 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
            {error || t('worker_not_found')}
          </Text>
          <Button onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>{t('go_back')}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookNow = () => {
    // Navigate directly to booking - user will select service in the booking flow
    navigation.navigate('Booking', {
      workerId: workerId,
      serviceKey: 'basic' // Default service, user can change in booking flow
    } as any);
  };

  const handleCall = () => {
    Alert.alert(t('call') + ' ' + t('service_provider'), t('confirm_call'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('call'), onPress: () => console.log('Calling worker...') }
    ]);
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
              src={worker.avatar || undefined} 
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
                <Badge variant={worker.status === 'available' ? "default" : "secondary"}>
                  {worker.status === 'available' ? (language === 'fr' ? 'Disponible' : 'Available') : (language === 'fr' ? 'Occupé' : 'Busy')}
                </Badge>
              </View>

              <View style={styles.workerStats}>
                <View style={styles.statItem}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {worker.distanceKm ? `${worker.distanceKm.toFixed(1)} km` : ''} {language === 'fr' ? 'de distance' : 'away'}
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
              <Text 
                style={[styles.statNumber, { color: theme.accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {worker.totalJobsCompleted}
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
            <View style={styles.statColumn}>
              <Text 
                style={[styles.statNumber, { color: theme.accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {worker.experienceYears || 0}
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
            <View style={styles.statColumn}>
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
        {worker.bio && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('about_worker').replace(' {name}', '')}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{worker.bio}</Text>
          </Card>
        )}

        {/* Services */}
        {worker.services && worker.services.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('services_offered')}</Text>
            <View style={styles.specialtiesContainer}>
              {worker.services.map((service, index) => (
                <Badge key={index} variant="secondary" style={styles.specialtyBadge}>
                  {service}
                </Badge>
              ))}
            </View>
          </Card>
        )}

        {/* Specialties */}
        {worker.specialties && worker.specialties.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('specialties')}</Text>
            <View style={styles.specialtiesContainer}>
              {worker.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" style={styles.specialtyBadge}>
                  {specialty}
                </Badge>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { paddingBottom: Math.max(insets.bottom + 20, 44), backgroundColor: theme.bg, borderTopColor: theme.cardBorder }]}>
        <Button 
          style={[styles.bookButton, worker.status !== 'available' && styles.disabledButton]} 
          disabled={worker.status !== 'available'} 
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>
            {t('book_now')} - {worker.price} MAD
          </Text>
        </Button>

        <View style={styles.contactButtons}>
          <Button variant="outline" style={styles.callButton} onPress={handleChat}>
            <MessageCircle size={16} color={theme.accent} />
            <Text style={[styles.callButtonText, { color: theme.accent }]}>{t('chat')}</Text>
          </Button>

          <Button variant="outline" style={styles.callButton} onPress={handleCall}>
            <Phone size={16} color={theme.accent} />
            <Text style={[styles.callButtonText, { color: theme.accent }]}>{t('call')}</Text>
          </Button>
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
  sectionCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
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
    textAlign: 'center',
    flexShrink: 1,
    fontWeight: '500',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
  },


});