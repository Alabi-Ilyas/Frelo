import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import {
  LayoutGrid, Briefcase, Users, Calendar,
  CheckSquare, Settings, Receipt,
  CalendarCheck, Clock, UserCircle, Bell,
} from "lucide-react-native";

import Dashboard          from "./DashboardScreen";
import ProjectScreen      from "./ProjectScreen";
import ProjectDetailScreen from "./ProjectDetailScreen";
import TasksScreen        from "./TaskScreen";
import ClientScreen       from "./ClientScreen";
import ClientDetailScreen from "./ClientDetailScreen";
import CalendarScreen     from "./CalendarScreen";
import InvoiceScreen      from "./InvoiceScreen";
import AvailabilityScreen from "./AvailabilityScreen";
import SettingsScreen     from "./SettingsScreen";
import NotificationScreen from "./NotificationScreen";
import ProfileScreen      from "./ProfileScreen";

import { CustomDrawerContent } from "./CustomDrawer";
import { useAuth } from "../components/context/AuthContext";

const Drawer = createDrawerNavigator();
const Stack  = createStackNavigator();

function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectList"   component={ProjectScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

function ClientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientList"   component={ClientScreen} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
    </Stack.Navigator>
  );
}

const drawerOpts = {
  headerShown: false,
  drawerType: "slide",
  overlayColor: "rgba(0,6,19,0.5)",
  drawerStyle: { backgroundColor: "#000613", width: 280 },
  drawerActiveTintColor: "#ADFF2F",
  drawerInactiveTintColor: "rgba(255,255,255,0.4)",
  drawerActiveBackgroundColor: "rgba(173,255,47,0.12)",
  drawerLabelStyle: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginLeft: -8 },
};

export default function SidebarNav() {
  const { user } = useAuth();
  const isFreelancer = (user?.role ?? "freelancer") === "freelancer";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={drawerOpts}
    >
      {/* ── Shared ─────────────────────────────────────────────────── */}
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ drawerIcon: ({ color }) => <LayoutGrid size={20} color={color} /> }}
      />

      {/* ── Freelancer routes ───────────────────────────────────────── */}
      {isFreelancer && (
        <>
          <Drawer.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ title: "Task Registry", drawerIcon: ({ color }) => <CheckSquare size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Projects"
            component={ProjectsStack}
            options={{ drawerIcon: ({ color }) => <Briefcase size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Clients"
            component={ClientsStack}
            options={{ drawerIcon: ({ color }) => <Users size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Invoices"
            component={InvoiceScreen}
            options={{ title: "Financial Ledger", drawerIcon: ({ color }) => <Receipt size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ title: "Schedule", drawerIcon: ({ color }) => <Calendar size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Availability"
            component={AvailabilityScreen}
            options={{ title: "Work Hours", drawerIcon: ({ color }) => <CalendarCheck size={20} color={color} /> }}
          />
        </>
      )}

      {/* ── Client routes ───────────────────────────────────────────── */}
      {!isFreelancer && (
        <>
          <Drawer.Screen
            name="Projects"
            component={ProjectsStack}
            options={{ drawerIcon: ({ color }) => <Briefcase size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Invoices"
            component={InvoiceScreen}
            options={{ title: "Financial Ledger", drawerIcon: ({ color }) => <Receipt size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Booking"
            component={CalendarScreen}
            options={{ title: "Appointments", drawerIcon: ({ color }) => <Calendar size={20} color={color} /> }}
          />
          <Drawer.Screen
            name="Notifications"
            component={NotificationScreen}
            options={{ title: "Notifications", drawerIcon: ({ color }) => <Bell size={20} color={color} /> }}
          />
        </>
      )}

      {/* ── Shared bottom routes ────────────────────────────────────── */}
      {isFreelancer && (
        <Drawer.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{ drawerItemStyle: { display: "none" } }}
        />
      )}

      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile", drawerIcon: ({ color }) => <UserCircle size={20} color={color} /> }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerIcon: ({ color }) => <Settings size={20} color={color} /> }}
      />
    </Drawer.Navigator>
  );
}
