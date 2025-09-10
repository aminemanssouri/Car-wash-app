import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Dimensions, useWindowDimensions, Alert, FlatList, ViewToken } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { User, Bell, Search, Navigation as NavIcon, Menu, Home as HomeIcon, Wrench, Calendar, MessageCircle, Store, Settings, LogOut } from 'lucide-react-native';
import LeafletMap from '../components/LeafletMap';
import { Button } from '../components/ui/Button';
import { mockWorkers, Worker } from '../data/workers';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import SideMenu from '../components/ui/SideMenu';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const theme = useThemeColors();
  const { t } = useLanguage();
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuth();
  const userRole = (user as any)?.profile?.role || 'customer';
  const [menuVisible, setMenuVisible] = useState(false);
  // Leave room (≈56px) for the stacked top-right buttons and margins
  const searchWidth = Math.min(Math.max(width - 24 - 56, 220), 640);
  const [centerOn, setCenterOn] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState('');

  const filteredWorkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockWorkers;
    return mockWorkers.filter((w) => {
      const nameMatch = w.name.toLowerCase().includes(q);
      const serviceMatch = (w.services || []).some((s) => s.toLowerCase().includes(q));
      return nameMatch || serviceMatch;
    });
  }, [query]);

  const renderWorkerMarker = (worker: Worker) => (
    <Pressable
      key={worker.id}
      style={[
        styles.workerMarker,
        {
          left: `${((worker.location.longitude + 8) * 100)}%`,
          top: `${((31.65 - worker.location.latitude) * 1000)}%`,
        },
        selectedWorker === worker.id && styles.selectedMarker,
      ]}
      onPress={() => setSelectedWorker(selectedWorker === worker.id ? null : worker.id)}
    >
      <View style={[styles.avatar, selectedWorker === worker.id && styles.selectedAvatar]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.accent, borderColor: theme.card }]}>
          <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
        </View>
        <View style={[styles.onlineIndicator, { borderColor: theme.card }]} />
      </View>

      {selectedWorker === worker.id && (
        <View style={[styles.workerPopup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.popupHeader}>
            <View style={[styles.avatarSmall, { backgroundColor: theme.accent, borderColor: theme.card }]}>
              <Text style={styles.avatarTextSmall}>{worker.name.charAt(0)}</Text>
            </View>
            <View style={styles.workerInfo}>
              <Text style={[styles.workerName, { color: theme.textPrimary }]} numberOfLines={1}>{worker.name}</Text>
              <Text style={[styles.workerSpecialty, { color: theme.textSecondary }]}>{worker.services[0]}</Text>
            </View>
          </View>
          
          <View style={styles.popupDetails}>
            <View style={styles.ratingContainer}>
              <Text style={styles.star}>★</Text>
              <Text style={[styles.rating, { color: theme.textSecondary }]}>{worker.rating} ({worker.reviewCount})</Text>
            </View>
            <Text style={[styles.distance, { color: theme.textSecondary }]}>0.5 {t('km_away')}</Text>
          </View>
          
          <View style={styles.popupFooter}>
            <Text style={[styles.price, { color: theme.accent }]}>{worker.price} MAD</Text>
            <Button 
              size="sm" 
              onPress={() => navigation.navigate('Booking', { workerId: worker.id })}
            >
              {t('book_now')}
            </Button>
          </View>
          
          <View style={[styles.popupArrow, { borderTopColor: theme.card }]} />
        </View>
      )}
    </Pressable>
  );

  return (
    <>
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Interactive Map (Leaflet + OSM) */}
      <View style={styles.mapContainer}>
        <LeafletMap
          initialRegion={{ latitude: 31.6295, longitude: -7.9811, zoom: 13 }}
          markers={filteredWorkers.map((w) => ({
            id: w.id,
            latitude: w.location.latitude,
            longitude: w.location.longitude,
            title: w.name,
            subtitle: w.services?.[0],
            price: w.price,
          }))}
          onMarkerPress={(id) => {
            const next = selectedWorker === id ? null : id;
            setSelectedWorker(next);
            const w = mockWorkers.find(m => m.id === id);
            if (w) {
              setCenterOn(null);
              const coords = { latitude: w.location.latitude, longitude: w.location.longitude, zoom: 15 };
              setTimeout(() => setCenterOn(coords), 0);
            }
          }}
          onBookNow={(id) => navigation.navigate('Booking', { workerId: id })}
          centerOn={centerOn}
          myLocation={myLocation}
          selectedId={selectedWorker}
          darkMode={theme.isDark}
        />
      </View>

      {/* Floating search bar - moved to right */}
      <View style={[styles.searchContainer, { width: searchWidth, backgroundColor: theme.surface, borderColor: theme.cardBorder, right: 12, left: 'auto' }]}>
        <Search color={theme.textSecondary} size={16} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder={t('search_placeholder')}
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => {
            const first = filteredWorkers[0];
            if (first) {
              setSelectedWorker(first.id);
              const coords = { latitude: first.location.latitude, longitude: first.location.longitude, zoom: 15 };
              setCenterOn(null);
              setTimeout(() => setCenterOn(coords), 0);
            }
          }}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 16 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Left side buttons - vertically stacked */}
      <View style={styles.leftButtons}>
        <Pressable style={[styles.hamburgerButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]} onPress={() => setMenuVisible(true)}>
          <Menu color={theme.textPrimary} size={22} />
        </Pressable>
        <Pressable style={[styles.floatingButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]} onPress={() => navigation.navigate('ComingSoon', { feature: 'Notifications' }) }>
          <Bell color={theme.textPrimary} size={20} />
        </Pressable>
        <Pressable 
          style={[styles.floatingButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          onPress={() => (navigation as any).navigate('Profile')}
        >
          <User color={theme.textPrimary} size={20} />
        </Pressable>
        <Pressable 
          style={[styles.floatingButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          onPress={async () => {
            if (locating) return;
            try {
              setLocating(true);
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(t('location_permission'), t('permission_denied_msg'));
                const fallback = { latitude: 31.6295, longitude: -7.9811, zoom: 13 };
                setCenterOn(null);
                setTimeout(() => setCenterOn(fallback), 0);
                return;
              }
              const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, zoom: 15 };
              setMyLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
              setCenterOn(null);
              setTimeout(() => setCenterOn(coords), 0);
            } catch (e) {
              const fallback = { latitude: 31.6295, longitude: -7.9811, zoom: 13 };
              setCenterOn(null);
              setTimeout(() => setCenterOn(fallback), 0);
            } finally {
              setLocating(false);
            }
          }}
        >
          <NavIcon color={theme.textPrimary} size={20} />
        </Pressable>
      </View>

      {/* GPS recenter button moved into topButtons above */}

      {/* Worker full-width horizontal pager */}
      <View style={styles.carouselContainer}>
        <FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
          renderItem={({ item: worker }) => (
            <View style={{ width: screenWidth }}>
              <Pressable
                style={[
                  styles.workerCardFull,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  selectedWorker === worker.id && { borderColor: theme.accent },
                ]}
                onPress={() => navigation.navigate('WorkerDetail', { workerId: worker.id })}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.cardAvatar, { backgroundColor: theme.accent, borderColor: theme.card }]}>
                    <Text style={styles.cardAvatarText}>{worker.name.charAt(0)}</Text>
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: theme.textPrimary }]} numberOfLines={1}>{worker.name}</Text>
                    <Text style={[styles.workerSpecialty, { color: theme.textSecondary }]}>{worker.services[0]}</Text>
                    
                    <View style={styles.cardDetails}>
                      <View style={styles.cardRating}>
                        <Text style={styles.cardStar}>★</Text>
                        <Text style={[styles.cardRatingText, { color: theme.textSecondary }]}>
                          {worker.rating} ({worker.reviewCount})
                        </Text>
                      </View>
                      <Text style={[styles.cardDivider, { color: theme.cardBorder }]}>•</Text>
                      <Text style={[styles.cardDistance, { color: theme.textSecondary }]}>0.5 {t('km_away')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardActions}>
                    <Text style={[styles.cardPrice, { color: theme.accent }]}>{worker.price} MAD</Text>
                    <Button 
                      size="sm" 
                      onPress={() => navigation.navigate('Booking', { workerId: worker.id })}
                    >
                      {t('book')}
                    </Button>
                  </View>
                </View>
              </Pressable>
            </View>
          )}
          onViewableItemsChanged={useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
            if (viewableItems && viewableItems.length > 0) {
              const first = viewableItems[0];
              const worker = first.item as Worker;
              if (worker?.id) {
                setSelectedWorker(worker.id);
                setCenterOn(null);
                const coords = { latitude: worker.location.latitude, longitude: worker.location.longitude, zoom: 15 };
                setTimeout(() => setCenterOn(coords), 0);
              }
            }
          }).current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        />
      </View>
    </View>
    {/* Side Menu Overlay */}
    <SideMenu
      visible={menuVisible}
      onClose={() => setMenuVisible(false)}
      theme={theme}
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>{t('menu')}</Text>
        </View>
      }
      items={
        userRole === 'worker'
          ? [
              {
                key: 'dashboard',
                label: t('dashboard'),
                icon: <HomeIcon size={18} color={theme.textPrimary} />,
                onPress: () => (navigation as any).navigate('Dashboard'),
              },
            ]
          : [
              {
                key: 'home',
                label: t('home'),
                icon: <HomeIcon size={18} color={theme.textPrimary} />,
                onPress: () => (navigation as any).navigate('Home'),
              },
              {
                key: 'services',
                label: t('services_title'),
                icon: <Wrench size={18} color={theme.textPrimary} />,
                onPress: () => (navigation as any).navigate('Services'),
              },
              {
                key: 'bookings',
                label: t('my_bookings'),
                icon: <Calendar size={18} color={theme.textPrimary} />,
                onPress: () => (navigation as any).navigate('Bookings'),
              },
              {
                key: 'messaging',
                label: t('messaging'),
                icon: <MessageCircle size={18} color={theme.textPrimary} />,
                onPress: () => navigation.navigate('ComingSoon', { feature: 'Messaging' }),
              },
              {
                key: 'store',
                label: t('store'),
                icon: <Store size={18} color={theme.textPrimary} />,
                onPress: () => navigation.navigate('ComingSoon', { feature: 'Store' }),
              },
            ]
      }
      footerItems={[
        {
          key: 'settings',
          label: t('settings'),
          icon: <Settings size={18} color={theme.textPrimary} />,
          onPress: () => (navigation as any).navigate('Settings'),
        },
        {
          key: 'logout',
          label: t('sign_out'),
          icon: <LogOut size={18} color={theme.textPrimary} />,
          onPress: async () => {
            try {
              await signOut();
            } finally {
              (navigation as any).navigate('Login');
            }
          },
        },
      ]}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  workerPopupOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  workerMarker: {
    position: 'absolute',
    zIndex: 10,
  },
  selectedMarker: {
    zIndex: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    position: 'relative',
  },
  selectedAvatar: {
    transform: [{ scale: 1.1 }],
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
  },
  workerPopup: {
    position: 'absolute',
    bottom: 50,
    left: -88,
    width: 176,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarTextSmall: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  workerSpecialty: {
    fontSize: 10,
    color: '#6b7280',
  },
  popupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#fbbf24',
    fontSize: 12,
    marginRight: 2,
  },
  rating: {
    fontSize: 10,
    color: '#374151',
  },
  distance: {
    fontSize: 10,
    color: '#6b7280',
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  popupArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  currentLocation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -8,
    marginLeft: -8,
    zIndex: 20,
  },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    opacity: 0.3,
  },
  searchContainer: {
    position: 'absolute',
    top: 42,
    right: 12,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  leftButtons: {
    position: 'absolute',
    top: 49,
    left: 12,
    flexDirection: 'column',
    zIndex: 30,
  },
  hamburgerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  carouselContent: {
    paddingHorizontal: 12,
  },
  workerCard: {
    width: 224,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCard: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: 'white',
    shadowOpacity: 0.15,
  },
  workerCardFull: {
    marginHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStar: {
    color: '#fbbf24',
    fontSize: 12,
    marginRight: 2,
  },
  cardRatingText: {
    fontSize: 10,
    color: '#6b7280',
  },
  cardDivider: {
    fontSize: 10,
    color: '#d1d5db',
    marginHorizontal: 4,
  },
  cardDistance: {
    fontSize: 10,
    color: '#6b7280',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
});
