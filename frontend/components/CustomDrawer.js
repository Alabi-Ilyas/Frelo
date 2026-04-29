import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { LogOut } from "lucide-react-native";
import { useAuth } from "../components/context/AuthContext";
import { C } from "../utils/theme";

export function CustomDrawerContent(props) {
  const { user, logout } = useAuth();
  const role = user?.role ?? "freelancer";

  return (
    <SafeAreaView style={s.root}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>

        {/* Brand header — matches web sidebar exactly */}
        <View style={s.brand}>
          <Text style={s.brandName}>FreloPro</Text>
          <Text style={s.brandTag}>VERDANT EDITION</Text>
          <View style={[s.rolePill, role === "freelancer" ? s.rolePillDark : s.rolePillLight]}>
            <Text style={[s.roleText, role === "freelancer" ? s.roleTextDark : s.roleTextLight]}>
              {role.toUpperCase()} PORTAL
            </Text>
          </View>
        </View>

        {/* Nav items */}
        <View style={s.nav}>
          <DrawerItemList
            {...props}
            activeBackgroundColor="rgba(173,255,47,0.15)"
            activeTintColor={C.secondaryContainer}
            inactiveTintColor="rgba(255,255,255,0.45)"
            labelStyle={s.navLabel}
          />
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <LogOut size={18} color="#FF4B4B" />
          <Text style={s.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
        <Text style={s.version}>v1.0.4  •  VERDANT SYSTEMS</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.primary },

  brand:    { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", marginBottom: 8 },
  brandName:{ fontSize: 26, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  brandTag: { fontSize: 9, fontWeight: "900", color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 3 },

  rolePill:      { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 14 },
  rolePillDark:  { backgroundColor: C.secondaryContainer },
  rolePillLight: { backgroundColor: "rgba(255,255,255,0.12)" },
  roleText:      { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  roleTextDark:  { color: C.primary },
  roleTextLight: { color: "#fff" },

  nav:      { paddingHorizontal: 10, paddingTop: 4 },
  navLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginLeft: -8 },

  footer:     { paddingHorizontal: 20, paddingVertical: 24, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  logoutBtn:  { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: "rgba(255,75,75,0.08)", borderRadius: 14 },
  logoutText: { color: "#FF4B4B", fontWeight: "900", fontSize: 11, letterSpacing: 1.5 },
  version:    { color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 14, textAlign: "center", fontWeight: "700", letterSpacing: 1 },
});
