import React, { useState } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { useAuth } from "../components/context/AuthContext";
import { loginUser } from "../api/apiCalls";
import { C } from "../utils/theme";

export default function SignIn({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState("");

  const handleSignIn = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return setError("Email and password are required.");
    setLoading(true); setError("");
    try {
      const res = await loginUser({ email: cleanEmail, password });
      if (res?.success) await login(res.user, res.accessToken, res.refreshToken);
    } catch (err) {
      setError(err.response?.data?.message || "Check your network connection.");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <StatusBar style="dark" />

        {/* Brand */}
        <View style={s.brand}>
          <Text style={s.brandName}>FreloPro</Text>
          <Text style={s.brandTag}>VERDANT EDITION</Text>
        </View>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.tagline}>CONTINUE YOUR JOURNEY</Text>
          <Text style={s.heading}>Welcome back</Text>
          <Text style={s.subheading}>Enter your credentials to access your architectural workspace.</Text>
        </View>

        {/* Toggle pills */}
        <View style={s.toggleRow}>
          <TouchableOpacity style={s.toggleActive}>
            <Text style={s.toggleActiveText}>SIGN IN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.toggleInactive} onPress={() => navigation.navigate("SignUp")}>
            <Text style={s.toggleInactiveText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {!!error && (
          <View style={s.errorBox}>
            <View style={s.errorDot} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={s.form}>
          <Text style={s.label}>WORK EMAIL</Text>
          <View style={s.inputWrap}>
            <Mail size={17} color={C.outline} />
            <TextInput
              style={s.input} placeholder="architect@frelopro.com"
              placeholderTextColor={C.outline} value={email}
              onChangeText={v => { setEmail(v); setError(""); }}
              autoCapitalize="none" keyboardType="email-address"
            />
          </View>

          <View style={s.pwdHeader}>
            <Text style={s.label}>PASSWORD</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={s.recovery}>RECOVERY</Text>
            </TouchableOpacity>
          </View>
          <View style={s.inputWrap}>
            <Lock size={17} color={C.outline} />
            <TextInput
              style={s.input} placeholder="••••••••••••"
              placeholderTextColor={C.outline} value={password}
              onChangeText={v => { setPassword(v); setError(""); }}
              secureTextEntry={!showPwd}
            />
            <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
              {showPwd ? <EyeOff size={17} color={C.outline} /> : <Eye size={17} color={C.outline} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={handleSignIn} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={s.primaryBtnText}>ACCESS DASHBOARD</Text>
                  <ArrowRight size={18} color="#fff" />
                </>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.footer} onPress={() => navigation.navigate("SignUp")}>
          <Text style={s.footerText}>
            NEW TO FRELOPRO?{"  "}<Text style={s.footerAccent}>CREATE ACCOUNT</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: C.background, padding: 28, justifyContent: "center" },

  brand:      { marginBottom: 36 },
  brandName:  { fontSize: 28, fontWeight: "900", color: C.primary, letterSpacing: -1 },
  brandTag:   { fontSize: 9, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 2, marginTop: 2 },

  header:     { marginBottom: 28 },
  tagline:    { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: C.onSurfaceVar, marginBottom: 6 },
  heading:    { fontSize: 36, fontWeight: "900", color: C.primary, letterSpacing: -1, marginBottom: 8 },
  subheading: { fontSize: 14, color: C.onSurfaceVar, lineHeight: 21 },

  toggleRow:          { flexDirection: "row", backgroundColor: C.surfaceLow, borderRadius: 14, padding: 4, marginBottom: 24, gap: 4 },
  toggleActive:       { flex: 1, backgroundColor: C.card, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  toggleActiveText:   { fontSize: 10, fontWeight: "900", color: C.primary, letterSpacing: 1 },
  toggleInactive:     { flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleInactiveText: { fontSize: 10, fontWeight: "900", color: C.outline, letterSpacing: 1 },

  errorBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FEF2F2", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#FECACA" },
  errorDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.error },
  errorText: { flex: 1, fontSize: 12, fontWeight: "700", color: C.error },

  form:      { width: "100%" },
  label:     { fontSize: 9, fontWeight: "900", color: C.onSurface, letterSpacing: 1.5, marginBottom: 8, marginTop: 20 },
  pwdHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 8 },
  recovery:  { fontSize: 9, fontWeight: "900", color: C.primary, letterSpacing: 1 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.card, borderRadius: 16, height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: C.outlineVar },
  input:     { flex: 1, fontSize: 15, color: C.onSurface, fontWeight: "500" },

  primaryBtn:     { backgroundColor: C.primary, height: 58, borderRadius: 29, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 32 },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },

  footer:      { marginTop: 36, alignItems: "center" },
  footerText:  { fontSize: 11, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1 },
  footerAccent:{ color: C.primary },
});
