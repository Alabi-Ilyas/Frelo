import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import {
  User,
  Bell,
  Palette,
  Clock,
  Globe,
  Shield,
  ChevronRight,
  LogOut,
} from "lucide-react-native";
import ScreenHeader from "./ScreenHeader";

export default function SettingsScreen({ navigation }) {
  // Mock state for switches - link these to your user.notifications backend
  const [notifs, setNotifs] = useState({ newBooking: true, invoicePaid: true });

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    isLast,
    toggle,
  }) => (
    <TouchableOpacity
      style={[styles.item, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
      disabled={!!toggle}
    >
      <View style={styles.iconBox}>
        <Icon size={20} color="#1A1C19" />
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onValueChange}
          trackColor={{ true: "#10B981" }}
        />
      ) : (
        <ChevronRight size={18} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Settings" tagline="CONFIGURATION" />

      {/* SECTION 1: ACCOUNT */}
      <Text style={styles.sectionHeader}>IDENTITY</Text>
      <View style={styles.card}>
        <SettingItem
          icon={User}
          title="Profile Details"
          subtitle="Name, Business Name, Avatar"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <SettingItem
          icon={Shield}
          title="Security"
          subtitle="Email and Password"
          onPress={() => navigation.navigate("UpdateEmail")}
          isLast
        />
      </View>

      {/* SECTION 2: WORKFLOW */}
      <Text style={styles.sectionHeader}>WORKFLOW</Text>
      <View style={styles.card}>
        <SettingItem
          icon={Clock}
          title="Work Hours"
          subtitle="Manage booking availability"
          onPress={() => navigation.navigate("Availability")}
        />
        <SettingItem
          icon={Bell}
          title="Invoice Alerts"
          toggle={{
            value: notifs.invoicePaid,
            onValueChange: (v) =>
              setNotifs((prev) => ({ ...prev, invoicePaid: v })),
          }}
        />
      </View>

      {/* SECTION 3: SYSTEM */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <View style={styles.card}>
        <SettingItem
          icon={Palette}
          title="Appearance"
          subtitle="Verdant, Dark, Forest themes"
          onPress={() => navigation.navigate("ThemeSettings")}
        />
        <SettingItem
          icon={Globe}
          title="Localization"
          subtitle="Currency and Timezone"
          onPress={() => navigation.navigate("Preferences")}
          isLast
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <LogOut size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    marginLeft: 24,
    marginBottom: 8,
    marginTop: 24,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F0F1EB",
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FBFDF8",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4EF",
    justifyContent: "center",
    alignItems: "center",
  },
  textColumn: { flex: 1, marginLeft: 16 },
  itemTitle: { fontSize: 15, fontWeight: "700", color: "#1A1C19" },
  itemSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 40,
    marginBottom: 60,
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: "#EF4444" },
});
