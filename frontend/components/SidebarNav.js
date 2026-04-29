import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import {
  LayoutGrid, Briefcase, Users, Calendar,
  CheckSquare, Settings, Bell, Receipt,
  CalendarCheck, Clock, UserCircle,
} from "lucide-react-native";

import Dashboard        from "./DashboardScreen";
import ProjectScreen    from "./ProjectScreen";
import ProjectDetailScreen from "./ProjectDetailScreen";
import TasksScreen      from "./TaskScreen";
import ClientScreen     from "./ClientScreen";
import ClientDetailScreen from "./ClientDetailScreen";
import CalendarScreen   from "./CalendarScreen";
import InvoiceScreen    from "./InvoiceScreen";
import AvailabilityScreen from "./AvailabilityScreen";
import SettingsScreen   from "./SettingsScreen";
import NotificationScreen from "./NotificationScreen";
import ProfileScreen    from "./ProfileScreen";

import { CustomDrawerContent } from "./CustomDrawer";
import { useAuth } from "../components/context/AuthContext";

const Drawer = createDrawerNavigator();
const Stack  = createStackNavigator();

// Stack for Projects (list + detail)
function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectList"   component={ProjectScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack for Clients (list + detail)
function ClientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientList"   component={ClientScreen} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
    </Stack.Navigator>
  );
}

export default function SidebarNav() {
  const { user } = useAuth();
  const userRole = user?.role ?? "freelancer";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        overlayColor: "rgba(0,6,19,0.5)",
        drawerStyle: { backgroundColor: "#000613", width: 280 },
        drawerActiveTintColor: "#ADFF2F",
        drawerInactiveTintColor: "rgba(255,255,255,0.4)",
        drawerActiveBackgroundColor: "rgba(173,255,47,0.12)",
        drawerLabelStyle: {
          fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginLeft: -8,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ drawerIcon: ({ color }) => <LayoutGrid size={20} color={color} /> }}
      />

      {userRole === "freelancer" && (
        <>
          <Drawer.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
              title: "Task Registry",
              drawerIcon: ({ color }) => <CheckSquare size={20} color={color} />,
            }}
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
            options={{
              title: "Financial Ledger",
              drawerIcon: ({ color }) => <Receipt size={20} color={color} />,
            }}
          />

          <Drawer.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              title: "Schedule",
              drawerIcon: ({ color }) => <Calendar size={20} color={color} />,
            }}
          />

          <Drawer.Screen
            name="Availability"
            component={AvailabilityScreen}
            options={{
              title: "Work Hours",
              drawerIcon: ({ color }) => <CalendarCheck size={20} color={color} />,
            }}
          />

          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: "Profile",
              drawerIcon: ({ color }) => <UserCircle size={20} color={color} />,
            }}
          />
        </>
      )}

      <Drawer.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ drawerItemStyle: { display: "none" } }}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerIcon: ({ color }) => <Settings size={20} color={color} /> }}
      />
    </Drawer.Navigator>
  );
}
