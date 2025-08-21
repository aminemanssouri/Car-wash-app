import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Dimensions, useWindowDimensions, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { User, Bell, Search, Navigation } from 'lucide-react-native';
import LeafletMap from '../components/LeafletMap';
import { Button } from '../components/ui/Button';
import { mockWorkers, Worker } from '../data/workers';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Leave room (≈56px) for the stacked top-right buttons and margins
  const searchWidth = Math.min(Math.max(width - 24 - 56, 220), 640);
  const [centerOn, setCenterOn] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

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
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>

      {selectedWorker === worker.id && (
        <View style={styles.workerPopup}>
          <View style={styles.popupHeader}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarTextSmall}>{worker.name.charAt(0)}</Text>
            </View>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName} numberOfLines={1}>{worker.name}</Text>
              <Text style={styles.workerSpecialty}>{worker.services[0]}</Text>
            </View>
          </View>
          
          <View style={styles.popupDetails}>
            <View style={styles.ratingContainer}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.rating}>{worker.rating} ({worker.reviewCount})</Text>
            </View>
            <Text style={styles.distance}>0.5 km away</Text>
          </View>
          
          <View style={styles.popupFooter}>
            <Text style={styles.price}>{worker.price} MAD</Text>
            <Button 
              size="sm" 
              onPress={() => navigation.navigate('Booking', { workerId: worker.id })}
            >
              Book Now
            </Button>
          </View>
          
          <View style={styles.popupArrow} />
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Interactive Map (Leaflet + OSM) */}
      <View style={styles.mapContainer}>
        <LeafletMap
          initialRegion={{ latitude: 31.6295, longitude: -7.9811, zoom: 13 }}
          markers={mockWorkers.map((w) => ({
            id: w.id,
            latitude: w.location.latitude,
            longitude: w.location.longitude,
            title: w.name,
            subtitle: w.services?.[0],
            price: w.price,
          }))}
          onMarkerPress={(id) => setSelectedWorker(selectedWorker === id ? null : id)}
          onBookNow={(id) => navigation.navigate('Booking', { workerId: id })}
          centerOn={centerOn}
          myLocation={myLocation}
        />
      </View>

      {/* Floating search bar */}
      <View style={[styles.searchContainer, { width: searchWidth }]}>
        <Search color="#6b7280" size={16} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for car wash services…"
          placeholderTextColor="#6b7280"
        />
      </View>

      {/* Top right buttons */}
      <View style={styles.topButtons}>
        <Pressable style={styles.floatingButton} onPress={() => Alert.alert('Notifications', 'Coming soon') }>
          <Bell color="#374151" size={20} />
        </Pressable>
        <Pressable 
          style={styles.floatingButton}
          onPress={() => (navigation as any).navigate('Profile')}
        >
          <User color="#374151" size={20} />
        </Pressable>
        <Pressable 
          style={styles.floatingButton}
          onPress={async () => {
            if (locating) return;
            try {
              setLocating(true);
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Location Permission', 'Permission denied. Using default city center.');
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
          <Navigation color="#374151" size={20} />
        </Pressable>
      </View>

      {/* GPS recenter button moved into topButtons above */}

      {/* Worker carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {mockWorkers.map((worker: Worker) => (
            <Pressable
              key={worker.id}
              style={[
                styles.workerCard,
                selectedWorker === worker.id && styles.selectedCard,
              ]}
              onPress={() => navigation.navigate('WorkerDetail', { workerId: worker.id })}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardAvatar}>
                  <Text style={styles.cardAvatarText}>{worker.name.charAt(0)}</Text>
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{worker.name}</Text>
                  <Text style={styles.workerSpecialty}>{worker.services[0]}</Text>
                  
                  <View style={styles.cardDetails}>
                    <View style={styles.cardRating}>
                      <Text style={styles.cardStar}>★</Text>
                      <Text style={styles.cardRatingText}>
                        {worker.rating} ({worker.reviewCount})
                      </Text>
                    </View>
                    <Text style={styles.cardDivider}>•</Text>
                    <Text style={styles.cardDistance}>0.5 km away</Text>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <Text style={styles.cardPrice}>{worker.price} MAD</Text>
                  <Button 
                    size="sm" 
                    onPress={() => navigation.navigate('Booking', { workerId: worker.id })}
                  >
                    Book
                  </Button>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
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
    shadowOffset: { width: 0, height: 4 },
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
    top: 50,
    left: 12,
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
  topButtons: {
    position: 'absolute',
    top: 64,
    right: 24,
    zIndex: 30,
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
