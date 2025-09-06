import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { ThemeProvider, useThemeColors } from './src/lib/theme';

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
      <AppInner />
    </ThemeProvider>
  );
}
