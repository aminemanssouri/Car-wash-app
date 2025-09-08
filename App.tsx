import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { ThemeProvider, useThemeColors } from './src/lib/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ModalProvider } from './src/contexts/ModalContext';

function AppInner() {
  const theme = useThemeColors();
  return (
    <>
      <Navigation />
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ModalProvider>
            <AppInner />
          </ModalProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
