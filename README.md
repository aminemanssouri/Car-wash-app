# CarWash Pro - React Native App

A professional car wash booking mobile application built with React Native and Expo, migrated from a Next.js web application.

## 🚀 Features

- **Interactive Map View** - SVG-based map with worker markers and real-time location
- **Worker Discovery** - Browse available car wash professionals with ratings and services
- **Booking Management** - View, track, and manage car wash appointments
- **User Authentication** - Login/Signup with email or phone number
- **Profile Management** - User profiles with contact information and preferences
- **Settings** - Comprehensive app settings and preferences
- **Form Validation** - React Hook Form with robust validation
- **Modern UI** - NativeWind (Tailwind CSS) styling with custom components

## 📱 Screenshots

The app includes the following main screens:
- **Home**: Interactive map with worker markers and horizontal carousel
- **Bookings**: Tabbed view of booking history with status tracking
- **Profile**: User profile management with guest and authenticated states
- **Settings**: Organized settings sections with toggles and navigation
- **Login/Signup**: Authentication screens with form validation

## 🛠 Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library (Stack + Bottom Tabs)
- **React Hook Form** - Form handling and validation
- **NativeWind** - Tailwind CSS for React Native
- **React Native SVG** - SVG rendering for maps
- **Lucide React Native** - Icon library

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd carwash-rn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

## 🏗 Project Structure

```
src/
├── components/
│   └── ui/                 # Reusable UI components
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── FormInput.tsx
│       ├── Input.tsx
│       ├── Label.tsx
│       ├── Separator.tsx
│       └── Switch.tsx
├── data/
│   ├── bookings.ts        # Mock booking data
│   └── workers.ts         # Mock worker data
├── navigation/
│   └── index.tsx          # Navigation configuration
├── screens/
│   ├── BookingsScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SettingsScreen.tsx
│   └── SignupScreen.tsx
└── utils/
    └── validationSchemas.ts # Form validation rules
```

## 🎨 UI Components

### Core Components
- **Button** - Customizable button with variants and sizes
- **Card** - Container component with shadows and borders
- **Avatar** - User avatar with image fallback to initials
- **Badge** - Status badges with color variants
- **FormInput** - Form input with React Hook Form integration
- **Switch** - Custom toggle switch component

### Form Validation
- Email/phone validation
- Password strength requirements
- Confirm password matching
- Terms agreement validation

## 🗺 Navigation Structure

```
App Navigator (Stack)
├── Main Tabs (Bottom Tabs)
│   ├── Home
│   ├── Bookings
│   ├── Profile
│   └── Settings
├── Login (Modal)
└── Signup (Modal)
```

## 📊 Data Management

### Mock Data
- **Workers**: Professional car wash service providers with location, ratings, and services
- **Bookings**: Sample booking history with various statuses and details

### State Management
- React Navigation for screen state
- React Hook Form for form state
- Local component state with React hooks

## 🔧 Configuration

### Expo Configuration (`app.json`)
- App name: "CarWash Pro"
- Primary color: #3b82f6 (Blue)
- Orientation: Portrait
- Platform support: iOS, Android, Web

### NativeWind Setup
- Tailwind CSS configuration
- Babel plugin integration
- Custom styling system

## 🚀 Deployment

The app is configured for deployment with Expo:

1. **Build for production**
   ```bash
   npx expo build
   ```

2. **Publish updates**
   ```bash
   npx expo publish
   ```

3. **Generate app binaries**
   ```bash
   npx expo build:ios
   npx expo build:android
   ```

## 🧪 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 📝 Migration Notes

This app was successfully migrated from a Next.js web application to React Native:

### Key Changes Made:
1. **Navigation**: Replaced Next.js routing with React Navigation
2. **Styling**: Migrated from CSS modules to NativeWind
3. **Components**: Adapted web components to React Native equivalents
4. **Forms**: Integrated React Hook Form for better mobile form handling
5. **SVG**: Used react-native-svg for map rendering
6. **Assets**: Configured proper asset handling for mobile

### Preserved Features:
- All original screens and functionality
- Design consistency and user experience
- Form validation and error handling
- Mock data structure and business logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the Expo documentation
- Review React Native guides

---

**Built with ❤️ using React Native and Expo**



## sugested packages

# Core packages
npm install @tanstack/react-query zustand react-native-maps expo-notifications @react-native-async-storage/async-storage

# UI enhancements
npm install react-native-reanimated react-native-gesture-handler lottie-react-native react-native-modal

# Forms & validation
npm install yup react-native-keyboard-aware-scroll-view

# Media
npm install expo-camera expo-image-picker react-native-fast-image

# Date/Time
npm install dayjs react-native-calendars


# Analytics & monitoring
npm install @sentry/react-native

# Payment (choose one)
npm install react-native-stripe-sdk

# Authentication
npm install react-native-keychain @react-native-firebase/auth