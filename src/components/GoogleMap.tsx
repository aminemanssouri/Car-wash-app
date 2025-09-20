import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Text, Image, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';

export type GoogleMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  subtitle?: string;
  price?: number | string;
  avatar?: string | number | any; // Can be URL string or require() result
  services?: string[];
  rating?: number;
};

interface GoogleMapProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    zoom?: number;
  };
  markers: GoogleMapMarker[];
  onMarkerPress?: (id: string) => void;
  onBookNow?: (id: string) => void;
  centerOn?: { latitude: number; longitude: number; zoom?: number } | null;
  myLocation?: { latitude: number; longitude: number } | null;
  selectedId?: string | null;
  darkMode?: boolean;
}

export default function GoogleMap({ 
  initialRegion, 
  markers, 
  onMarkerPress, 
  onBookNow, 
  centerOn, 
  myLocation, 
  selectedId, 
  darkMode 
}: GoogleMapProps) {
  const mapRef = useRef<MapView>(null);

  // Convert zoom level to latitudeDelta/longitudeDelta
  const zoomToDeltas = (zoom: number) => {
    const delta = Math.pow(2, 15 - zoom) * 0.006866455078125;
    return {
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  };

  const region: Region = {
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
    ...zoomToDeltas(initialRegion.zoom || 13),
  };

  // Handle centerOn prop changes
  useEffect(() => {
    if (centerOn && mapRef.current) {
      const newRegion: Region = {
        latitude: centerOn.latitude,
        longitude: centerOn.longitude,
        ...zoomToDeltas(centerOn.zoom || 15),
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, [centerOn]);

  // Custom marker component for workers
  const renderWorkerMarker = (marker: GoogleMapMarker) => {
    const isSelected = selectedId === marker.id;
    
    return (
      <Marker
        key={marker.id}
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        onPress={() => onMarkerPress?.(marker.id)}
        anchor={{ x: 0.5, y: 0.5 }}
        centerOffset={{ x: 0, y: 0 }}
      >
        {/* Custom circular worker image marker */}
        <View style={[
          styles.workerMarker,
          isSelected && styles.workerMarkerSelected
        ]}>
          {marker.avatar ? (
            <Image 
              source={
                typeof marker.avatar === 'string' 
                  ? { uri: marker.avatar }  // Remote URL
                  : marker.avatar           // Local require()
              }
              style={styles.workerAvatar}
              onError={() => {
                // Handle image load error by showing fallback
              }}
            />
          ) : (
            <View style={styles.workerAvatarFallback}>
              <Text style={styles.workerAvatarText}>
                {marker.title?.charAt(0) || 'W'}
              </Text>
            </View>
          )}
          {isSelected && <View style={styles.selectedIndicator} />}
        </View>

        {/* Custom callout with service details and book now */}
        <Callout 
          tooltip={true}
          onPress={() => onBookNow?.(marker.id)}
        >
          <View style={styles.calloutContainer}>
            <View style={styles.calloutHeader}>
              <Text style={styles.calloutTitle}>{marker.title}</Text>
              {marker.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {marker.rating}</Text>
                </View>
              )}
            </View>
            
            {marker.services && marker.services.length > 0 && (
              <View style={styles.servicesContainer}>
                <Text style={styles.servicesLabel}>Services:</Text>
                <Text style={styles.servicesText}>
                  {marker.services.slice(0, 2).join(', ')}
                  {marker.services.length > 2 ? '...' : ''}
                </Text>
              </View>
            )}
            
            <View style={styles.calloutFooter}>
              <Text style={styles.priceText}>{marker.price} MAD</Text>
              <View style={styles.bookNowButton}>
                <Text style={styles.bookNowText}>Book Now</Text>
              </View>
            </View>
            
            {/* Callout arrow */}
            <View style={styles.calloutArrow} />
          </View>
        </Callout>
      </Marker>
    );
  };

  // Render user location marker
  const renderUserLocationMarker = () => {
    if (!myLocation) return null;
    
    return (
      <Marker
        coordinate={{
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
        }}
        title="Your Location"
        pinColor="#10b981"
      />
    );
  };

  // Dark mode map style
  const darkMapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#bdbdbd" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#181818" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#1b1b1b" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#2c2c2c" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8a8a8a" }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{ "color": "#373737" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#3c3c3c" }]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [{ "color": "#4e4e4e" }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#000000" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#3d3d3d" }]
    }
  ];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        customMapStyle={darkMode ? darkMapStyle : undefined}
        mapType="standard"
        mapPadding={{
          top: 120,  // Account for top search bar and buttons
          right: 25,
          bottom: 100, // Account for bottom navigation and card
          left: 80,   // Account for left side buttons
        }}
        onPress={() => {
          // Deselect marker when pressing on empty map area
          if (selectedId && onMarkerPress) {
            onMarkerPress('');
          }
        }}
      >
        {/* Render worker markers */}
        {markers.map(renderWorkerMarker)}
        
        {/* Render user location marker */}
        {renderUserLocationMarker()}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    overflow: 'visible', // Ensure markers aren't clipped
  },
  
  // Worker marker styles
  workerMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  workerMarkerSelected: {
    borderColor: '#3b82f6',
    borderWidth: 4,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  workerAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  
  // Callout styles
  calloutContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    minWidth: 250,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  servicesContainer: {
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  servicesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  bookNowButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  calloutArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
});
