import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet } from "react-native";

import { AuthProvider, useAuth } from "./components/context/AuthContext";

import Welcome        from "./components/WelcomeScreen";
import SignUp         from "./components/SignUpScreen";
import SignIn         from "./components/SignInScreen";
import ForgotPassword from "./components/ForgotPasswordScreen";
import ChangePassword from "./components/ChangePassword";

import SidebarNav from "./components/SidebarNav";

const Stack = createStackNavigator();

function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1A1C19" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={SidebarNav} />
      ) : (
        <>
          <Stack.Screen name="Welcome"        component={Welcome} />
          <Stack.Screen name="SignIn"         component={SignIn} />
          <Stack.Screen name="SignUp"         component={SignUp} />
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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFDF8",
  },
});
