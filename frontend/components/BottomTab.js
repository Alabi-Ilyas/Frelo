import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Dashboard from "./DashboardScreen";
import TaskScreen from "./TaskScreen";
import ProjectScreen from "./ProjectScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Tasks") iconName = focused ? "grid" : "grid-outline";
          else if (route.name === "Projects") iconName = focused ? "folder-open" : "folder-outline";

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: "#0A2166",
        tabBarInactiveTintColor: "#9DA1AB",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Outfit-SemiBold",
          fontSize: 11,
          marginBottom: 10,
        },
        tabBarStyle: {
          position: "absolute",
        
          bottom: Platform.OS === "ios" ? insets.bottom : 15, 
          left: 20,
          right: 20,
          backgroundColor: "#ffffff",
          borderRadius: 25,
          height: 70,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
        
          paddingBottom: 0, 
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Tasks" component={TaskScreen} />
      <Tab.Screen name="Projects" component={ProjectScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
   
    marginTop: 10,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF6600",
    marginTop: 4,
  },
});