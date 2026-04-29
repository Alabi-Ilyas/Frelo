import React, { useState } from "react";
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Mail, ArrowLeft } from "lucide-react-native";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim())
      return Alert.alert("Required", "Please enter your email address.");

    setLoading(true);
    // Simulate sending — backend reset flow is handled via Settings once logged in.
    // For the auth flow we just confirm and redirect to sign in.
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Check Your Email",
        "If an account exists for that email, you will receive reset instructions.",
        [{ text: "OK", onPress: () => navigation.navigate("SignIn") }]
      );
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />

        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#1A1C19" />
        </TouchableOpacity>

        <View style={s.header}>
          <Text style={s.tagline}>ACCOUNT RECOVERY</Text>
          <Text style={s.heading}>Forgot Password</Text>
          <Text style={s.subheading}>
            Enter your email address and we'll send you reset instructions.
          </Text>
        </View>

        <Text style={s.label}>EMAIL ADDRESS</Text>
        <View style={s.inputWrapper}>
          <Mail size={18} color="#6B7280" />
          <TextInput
            style={s.input}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity style={s.button} onPress={handleSend} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.buttonText}>SEND INSTRUCTIONS</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.footer} onPress={() => navigation.navigate("SignIn")}>
          <Text style={s.footerText}>
            REMEMBERED IT? <Text style={s.link}>SIGN IN</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#FBFDF8", padding: 24, justifyContent: "center" },
  backBtn:   { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F3F4EF", justifyContent: "center", alignItems: "center", marginBottom: 32 },
  header:    { marginBottom: 36 },
  tagline:   { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#6B7280", marginBottom: 4 },
  heading:   { fontSize: 32, fontWeight: "900", color: "#1A1C19", letterSpacing: -1 },
  subheading:{ fontSize: 14, color: "#6B7280", marginTop: 8, lineHeight: 20 },
  label:     { fontSize: 10, fontWeight: "900", color: "#1A1C19", marginBottom: 8, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#FFF", borderRadius: 16, height: 56,
    paddingHorizontal: 16, borderWidth: 1, borderColor: "#F0F1EB", marginBottom: 32,
  },
  input:     { flex: 1, fontSize: 15, color: "#1A1C19", fontWeight: "500" },
  button:    { backgroundColor: "#1A1C19", height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  buttonText:{ color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 2 },
  footer:    { marginTop: 32, alignItems: "center" },
  footerText:{ fontSize: 11, fontWeight: "900", color: "#6B7280", letterSpacing: 1 },
  link:      { color: "#1A1C19" },
});
