export default {
  expo: {
    name: "CarWash Pro",
    slug: "carwash-pro",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    description: "Professional car wash booking app - Find and book trusted car wash services near you",
    primaryColor: "#3b82f6",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#3b82f6"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: "YOUR_IOS_GOOGLE_MAPS_API_KEY"
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We use your location to show nearby car wash services and recenter the map."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: "https://prxsvouchiodqppqeamz.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHN2b3VjaGlvZHFwcHFlYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjI3MTUsImV4cCI6MjA3MjczODcxNX0.LPBGMPbEpY3yaljIHw4FKNTS7TDRq7_jhVw3u_cEUHU"
    }
  }
};
