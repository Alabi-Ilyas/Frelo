import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";

// Password changes for authenticated users are handled in SettingsScreen.
// This screen is kept for navigation compatibility but redirects to SignIn.
export default function ChangePassword({ navigation }) {
  return (
    <View style={s.container}>
      <StatusBar style="dark" />
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate("SignIn")}>
        <ArrowLeft size={20} color="#000613" />
      </TouchableOpacity>
      <Text style={s.heading}>Change Password</Text>
      <Text style={s.body}>
        To change your password, please sign in first and use the Settings screen.
      </Text>
      <TouchableOpacity style={s.button} onPress={() => navigation.navigate("SignIn")}>
        <Text style={s.buttonText}>GO TO SIGN IN</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#f8f9fa" },
  backBtn:   { width: 44, height: 44, borderRadius: 12, backgroundColor: "#f3f4f5", justifyContent: "center", alignItems: "center", marginBottom: 32 },
  heading:   { fontSize: 28, fontWeight: "900", color: "#000613", letterSpacing: -1, marginBottom: 12 },
  body:      { fontSize: 15, color: "#6B7280", lineHeight: 22, marginBottom: 32 },
  button:    { backgroundColor: "#000613", height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  buttonText:{ color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 2 },
});
