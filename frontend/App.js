import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";

// --- AUTH CONTEXT ---
import { AuthProvider, useAuth } from "./components/context/AuthContext";

// Auth Screens
import Welcome from "./components/WelcomeScreen";
import SignUp from "./components/SignUpScreen";
import SignIn from "./components/SignInScreen";
import ForgotPassword from "./components/ForgotPasswordScreen";
import ChangePassword from "./components/ChangePassword";

// Main App Navigation
import SidebarNav from "./components/SidebarNav";

const Stack = createStackNavigator();

/**
 * --- ROOT NAVIGATION GATEKEEPER ---
 * This handles the logic for switching between Auth and App stacks.
 */
function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. LOADING STATE: Prevents the "flash" of the login screen
  // while we check if the user is already logged in.
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1C19" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // 2. PROTECTED STACK: Only accessible if logged in
        <Stack.Screen name="MainApp" component={SidebarNav} />
      ) : (
        // 3. AUTH STACK: Only accessible if logged out
        <>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* AuthProvider must wrap the Navigator to share state */}
        <AuthProvider>
          <NavigationContainer>
            <RootNavigation />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFDF8",
  },
};
