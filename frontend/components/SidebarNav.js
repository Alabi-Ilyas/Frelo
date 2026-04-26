import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  LayoutGrid,
  Briefcase,
  Users,
  Calendar,
  CheckSquare,
  Settings,
  Bell,
  Receipt, // Added for Invoices
} from "lucide-react-native";

import Dashboard from "./DashboardScreen";
import ProjectScreen from "./ProjectScreen";
import TasksScreen from "./TaskScreen";
import ClientsScreen from "./ClientScreen";
import CalendarScreen from "./CalendarScreen"; // Added
import InvoiceScreen from "./InvoiceScreen"; // Added
import AvailabilityScreen from "./AvailabilityScreen";
import SettingsScreen from "./SettingsScreen";
import NotificationScreen from "./NotificationScreen";

import { CustomDrawerContent } from "./CustomDrawer";
import { useAuth } from "../components/context/AuthContext";

const Drawer = createDrawerNavigator();

export default function SidebarNav() {
  const { user } = useAuth();
  const userRole = user?.role || "freelancer";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        overlayColor: "rgba(26, 28, 25, 0.4)",
        drawerStyle: { backgroundColor: "#FBFDF8", width: 300 },
        drawerActiveTintColor: "#1A1C19",
        drawerInactiveTintColor: "#6B7280",
        drawerActiveBackgroundColor: "rgba(215, 232, 205, 0.4)",
        drawerLabelStyle: {
          fontSize: 12,
          fontWeight: "900",
          letterSpacing: 1,
          marginLeft: -10,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          drawerIcon: ({ color }) => <LayoutGrid size={20} color={color} />,
        }}
      />

      {userRole === "freelancer" && (
        <>
          <Drawer.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
              title: "Task Registry",
              drawerIcon: ({ color }) => (
                <CheckSquare size={20} color={color} />
              ),
            }}
          />

          {/* CALENDAR ADDED HERE */}
          <Drawer.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              title: "Schedule",
              drawerIcon: ({ color }) => <Calendar size={20} color={color} />,
            }}
          />

          <Drawer.Screen
            name="Projects"
            component={ProjectScreen}
            options={{
              drawerIcon: ({ color }) => <Briefcase size={20} color={color} />,
            }}
          />

          {/* INVOICE SCREEN ADDED HERE */}
          <Drawer.Screen
            name="Invoices"
            component={InvoiceScreen}
            options={{
              title: "Financial Ledger",
              drawerIcon: ({ color }) => <Receipt size={20} color={color} />,
            }}
          />

          <Drawer.Screen
            name="Clients"
            component={ClientsScreen}
            options={{
              drawerIcon: ({ color }) => <Users size={20} color={color} />,
            }}
          />

          <Drawer.Screen
            name="Availability"
            component={AvailabilityScreen}
            options={{
              title: "Work Hours",
              drawerIcon: ({ color }) => <Calendar size={20} color={color} />,
            }}
          />
        </>
      )}

      {/* UTILITY SCREENS */}
      <Drawer.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          drawerItemStyle: { display: "none" }, // Hidden from menu but accessible via code
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}
