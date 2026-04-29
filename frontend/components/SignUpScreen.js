import React, { useState } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Hammer, Briefcase, Eye, EyeOff, Check, ArrowRight } from "lucide-react-native";
import { registerUser } from "../api/apiCalls";
import { C } from "../utils/theme";

export default function SignUp({ navigation }) {
  const [role, setRole]               = useState("freelancer");
  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPwd, setShowPwd]         = useState(false);
  const [checked, setChecked]         = useState(false);
  const [error, setError]             = useState("");

  const handleSignUp = async () => {
    if (!checked) return setError("Please agree to the Terms & Conditions.");
    if (!fullName || !email || !password || !businessName) return setError("Please fill all fields.");
    setLoading(true); setError("");
    try {
      const res = await registerUser({ name: fullName, email, password, businessName, role });
      if (res.success) { Alert.alert("Account Created", "You can now sign in."); navigation.navigate("SignIn"); }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
          <Text style={s.tagline}>JOIN THE COLLECTIVE</Text>
          <Text style={s.heading}>Create Account</Text>
          <Text style={s.subheading}>Create your architectural workspace and start managing your freedom.</Text>
        </View>

        {/* Toggle */}
        <View style={s.toggleRow}>
          <TouchableOpacity style={s.toggleInactive} onPress={() => navigation.navigate("SignIn")}>
            <Text style={s.toggleInactiveText}>SIGN IN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.toggleActive}>
            <Text style={s.toggleActiveText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={s.progressRow}>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: "25%" }]} />
          </View>
          <Text style={s.progressLabel}>Step 1 of 4</Text>
        </View>

        {/* Error */}
        {!!error && (
          <View style={s.errorBox}>
            <View style={s.errorDot} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Role selector */}
        <Text style={s.label}>I WANT TO JOIN AS A:</Text>
        <View style={s.roleRow}>
          {[
            { id: "freelancer", label: "FREELANCER", Icon: Hammer },
            { id: "client",     label: "CLIENT",     Icon: Briefcase },
          ].map(({ id, label, Icon }) => (
            <TouchableOpacity
              key={id}
              style={[s.roleCard, role === id && s.roleCardActive]}
              onPress={() => setRole(id)}
              activeOpacity={0.8}
            >
              <Icon size={18} color={role === id ? C.secondaryContainer : C.onSurface} />
              <Text style={[s.roleLabel, role === id && s.roleLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fields */}
        <Text style={s.label}>BUSINESS NAME</Text>
        <TextInput style={s.input} placeholder="e.g. Studio Vertex" placeholderTextColor={C.outline}
          value={businessName} onChangeText={setBusinessName} />

        <Text style={s.label}>WORK EMAIL</Text>
        <TextInput style={s.input} placeholder="architect@frelopro.com" placeholderTextColor={C.outline}
          value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <Text style={s.label}>FULL NAME</Text>
        <TextInput style={s.input} placeholder="e.g. Elena Vance" placeholderTextColor={C.outline}
          value={fullName} onChangeText={setFullName} />

        <Text style={s.label}>SECURITY KEY</Text>
        <View style={s.inputWrap}>
          <TextInput style={[s.input, { flex: 1, borderWidth: 0, marginTop: 0 }]}
            placeholder="Minimum 6 characters" placeholderTextColor={C.outline}
            value={password} onChangeText={setPassword} secureTextEntry={!showPwd} />
          <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={{ paddingRight: 4 }}>
            {showPwd ? <EyeOff size={17} color={C.outline} /> : <Eye size={17} color={C.outline} />}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <TouchableOpacity style={s.checkRow} onPress={() => setChecked(v => !v)} activeOpacity={0.7}>
          <View style={[s.checkbox, checked && s.checkboxActive]}>
            {checked && <Check size={12} color="#fff" />}
          </View>
          <Text style={s.checkLabel}>I agree to the Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.primaryBtn} onPress={handleSignUp} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={s.primaryBtnText}>LAUNCH WORKSPACE</Text>
                <ArrowRight size={18} color="#fff" />
              </>}
        </TouchableOpacity>

        <TouchableOpacity style={s.footer} onPress={() => navigation.navigate("SignIn")}>
          <Text style={s.footerText}>
            ALREADY HAVE AN ACCOUNT?{"  "}<Text style={s.footerAccent}>LOG IN</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: C.background, padding: 28 },

  brand:      { marginTop: 48, marginBottom: 28 },
  brandName:  { fontSize: 28, fontWeight: "900", color: C.primary, letterSpacing: -1 },
  brandTag:   { fontSize: 9, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 2, marginTop: 2 },

  header:     { marginBottom: 24 },
  tagline:    { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: C.onSurfaceVar, marginBottom: 6 },
  heading:    { fontSize: 32, fontWeight: "900", color: C.primary, letterSpacing: -1, marginBottom: 8 },
  subheading: { fontSize: 14, color: C.onSurfaceVar, lineHeight: 21 },

  toggleRow:          { flexDirection: "row", backgroundColor: C.surfaceLow, borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 },
  toggleActive:       { flex: 1, backgroundColor: C.card, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  toggleActiveText:   { fontSize: 10, fontWeight: "900", color: C.primary, letterSpacing: 1 },
  toggleInactive:     { flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleInactiveText: { fontSize: 10, fontWeight: "900", color: C.outline, letterSpacing: 1 },

  progressRow:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  progressBg:   { flex: 1, height: 5, backgroundColor: C.surfaceHigh, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: C.secondaryContainer, borderRadius: 3 },
  progressLabel:{ fontSize: 9, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1 },

  errorBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FEF2F2", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#FECACA" },
  errorDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.error },
  errorText: { flex: 1, fontSize: 12, fontWeight: "700", color: C.error },

  label:    { fontSize: 9, fontWeight: "900", color: C.onSurface, letterSpacing: 1.5, marginBottom: 8, marginTop: 16 },
  input:    { backgroundColor: C.card, borderRadius: 16, height: 54, paddingHorizontal: 18, borderWidth: 1, borderColor: C.outlineVar, fontSize: 14, fontWeight: "500", color: C.onSurface, marginTop: 0 },
  inputWrap:{ flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 16, height: 54, paddingHorizontal: 18, borderWidth: 1, borderColor: C.outlineVar },

  roleRow:       { flexDirection: "row", gap: 12, marginBottom: 4 },
  roleCard:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.outlineVar },
  roleCardActive:{ backgroundColor: C.primary, borderColor: C.primary },
  roleLabel:     { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: C.onSurface },
  roleLabelActive:{ color: C.secondaryContainer },

  checkRow:     { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 },
  checkbox:     { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: C.primary, alignItems: "center", justifyContent: "center" },
  checkboxActive:{ backgroundColor: C.primary },
  checkLabel:   { fontSize: 13, color: C.onSurfaceVar },

  primaryBtn:     { backgroundColor: C.primary, height: 58, borderRadius: 29, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 28 },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },

  footer:      { marginTop: 28, marginBottom: 20, alignItems: "center" },
  footerText:  { fontSize: 11, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1 },
  footerAccent:{ color: C.primary },
});
