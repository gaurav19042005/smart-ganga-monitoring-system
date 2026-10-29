import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router";

import { Stack } from "expo-router/stack";

import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import SmartNavigation from "@/components/SmartNavigation";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <View style={styles.root}>

        {/* Main Expo Router navigation */}
        <View style={styles.stackContainer}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                paddingTop:
                  Platform.OS === "web"
                    ? 72
                    : 0,

                paddingBottom:
                  Platform.OS !== "web"
                    ? 78
                    : 0,
              },
            }}
          />
        </View>

        {/* Smart Ganga Navigation */}
        <SmartNavigation />

        {/* Splash overlay */}
        <AnimatedSplashOverlay />

        <StatusBar style="auto" />

      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F8FC",
  },

  stackContainer: {
    flex: 1,
  },
});