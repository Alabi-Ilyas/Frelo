import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Dashboard from "./DashboardScreen";
import TaskScreen from "./TaskScreen";
import ProjectScreen from "./ProjectScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Tasks") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Projects") {
            iconName = focused ? "folder" : "folder-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0C1A4B",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 90,
          borderTopWidth: 0,
          paddingBottom: 10,
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
