import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

import { Colors } from '../constants/Colors';
import { AuthProvider } from '../services/auth';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // ✅ Forçar tema LIGHT para mockups
  const themeColors = Colors.light;

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  // ✅ Theme do navigation também forçado em LIGHT
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: themeColors.background,
      card: themeColors.card,
      text: themeColors.text,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            // ✅ Fundo branco em todas as telas
            contentStyle: { backgroundColor: themeColors.background },

            // ✅ Header claro
            headerStyle: { backgroundColor: themeColors.background },
            headerTintColor: themeColors.text,
            headerTitleStyle: { color: themeColors.text },
            headerBackTitle: 'Voltar',
          }}
        >
          {/* TABS (home principal) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* AUTH */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* ONBOARDING */}
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />

          {/* MODAL DE ASSINATURA */}
          <Stack.Screen
            name="subscription"
            options={{ presentation: 'modal', headerShown: false }}
          />

          {/* FERRAMENTAS */}
          <Stack.Screen
            name="tools/diet-generator"
            options={{ title: 'Gerador de Dieta' }}
          />
          <Stack.Screen
            name="tools/workout-generator"
            options={{ title: 'Gerador de Treino' }}
          />
          <Stack.Screen name="tools/notes" options={{ title: 'Anotações' }} />

          {/* CONFIGURAÇÕES */}
          <Stack.Screen
            name="settings/notifications"
            options={{ title: 'Notificações' }}
          />
          <Stack.Screen
            name="settings/privacy"
            options={{ title: 'Privacidade' }}
          />
          <Stack.Screen
            name="settings/payments"
            options={{ title: 'Pagamento & assinatura' }}
          />
          <Stack.Screen
            name="settings/support"
            options={{ title: 'Ajuda & suporte' }}
          />

          {/* MODAL PADRÃO */}
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
