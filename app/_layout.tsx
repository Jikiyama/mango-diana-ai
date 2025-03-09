import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import Colors from "@/constants/colors";
import { logger } from "@/utils/logger";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      logger.error('APP', 'Error loading fonts', error);
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      logger.info('APP', 'Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  logger.info('APP', 'Initializing root navigation');
  
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="auth" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="questionnaire" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="meal-details/[id]" 
        options={{ 
          title: "Meal Details",
          headerTintColor: Colors.primary,
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="nutrition-info" 
        options={{ 
          title: "Nutritional Information",
          headerTintColor: Colors.primary,
          headerBackTitleVisible: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="recipes" 
        options={{ 
          title: "Recipes",
          headerTintColor: Colors.primary,
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="profile/logs" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}