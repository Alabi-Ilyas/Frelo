import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ShieldCheck, Mail, Lightbulb } from "lucide-react-native";
import { getProfile, updateProfile } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import { C, shadow } from "../utils/theme";

export default function ProfileScreen() {
  const [user, setUser]               = useState(null);
  const [name, setName]               = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    getProfile()
      .then(res => {
        if (res?.success && res.user) {
          setUser(res.user);
          setName(res.user.name ?? "");
          setBusinessName(res.user.businessName ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({ name, businessName });
      Alert.alert("Saved", "Profile updated.");
    } catch {
      Alert.alert("Error", "Could not save profile.");
    } finally { setSaving(false); }
  };

  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const completionPct = Math.round(
    ([!!name, !!businessName, !!user?.email].filter(Boolean).length / 3) * 100
  );

  if (loading) return (
    <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
  );

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <ScreenHeader title="Profile." tagline="PROFESSIONAL PRESENCE" />

      {/* Avatar card */}
      <View style={[s.avatarCard, shadow]}>
        <View style={[s.avatar, { backgroundColor: user?.avatarColor ?? "#7C6EF8" }]}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.userName}>{name || "—"}</Text>
        <Text style={s.userEmail}>{user?.email}</Text>
        {businessName ? <Text style={s.businessName}>{businessName}</Text> : null}
      </View>

      {/* Completion card */}
      <View style={[s.completionCard, shadow]}>
        <ShieldCheck size={28} color={C.secondaryContainer} />
        <Text style={s.completionTitle}>Profile Completion</Text>
        <Text style={s.completionSub}>Your profile is {completionPct}% complete.</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${completionPct}%` }]} />
        </View>
      </View>

      {/* Form */}
      <View style={[s.formCard, shadow]}>
        <View style={s.formHeader}>
          <Text style={s.formTitle}>Personal Information</Text>
          <View style={s.requiredBadge}><Text style={s.requiredText}>Required</Text></View>
        </View>

        <Text style={s.fieldLabel}>FULL NAME</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={C.outline} />

        <Text style={s.fieldLabel}>BUSINESS NAME</Text>
        <TextInput style={s.input} value={businessName} onChangeText={setBusinessName} placeholder="Your studio or business name" placeholderTextColor={C.outline} />

        <Text style={s.fieldLabel}>EMAIL</Text>
        <View style={s.emailRow}>
          <Mail size={16} color={C.outline} />
          <Text style={s.emailText}>{user?.email ?? ""}</Text>
        </View>
        <Text style={s.emailHint}>Change email in Settings.</Text>
      </View>

      {/* Tip */}
      <View style={s.tipRow}>
        <Lightbulb size={18} color={C.secondary} />
        <Text style={s.tipText}>Your profile is visible to clients you work with on FreloPro.</Text>
      </View>

      {/* Actions */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.discardBtn} onPress={() => { if (user) { setName(user.name ?? ""); setBusinessName(user.businessName ?? ""); } }} disabled={saving}>
          <Text style={s.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.background },
  container: { paddingBottom: 100 },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.background },

  avatarCard: { backgroundColor: C.card, marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.outlineVar, alignItems: "center", marginBottom: 12 },
  avatar:     { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 30, fontWeight: "900", color: "#fff" },
  userName:   { fontSize: 20, fontWeight: "800", color: C.primary, letterSpacing: -0.5 },
  userEmail:  { fontSize: 13, color: C.onSurfaceVar, marginTop: 4 },
  businessName: { fontSize: 11, fontWeight: "900", color: C.secondary, letterSpacing: 1, marginTop: 4 },

  completionCard: { backgroundColor: C.primary, marginHorizontal: 16, borderRadius: 24, padding: 20, marginBottom: 12, gap: 6 },
  completionTitle:{ fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  completionSub:  { fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8 },
  progressBg:     { height: 6, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" },
  progressFill:   { height: "100%", backgroundColor: C.secondaryContainer, borderRadius: 3 },

  formCard:    { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.outlineVar, marginBottom: 12 },
  formHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  formTitle:   { fontSize: 16, fontWeight: "900", color: C.primary },
  requiredBadge:{ backgroundColor: C.surfaceLow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  requiredText: { fontSize: 9, fontWeight: "900", color: C.secondary },
  fieldLabel:  { fontSize: 9, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1.5, marginBottom: 6, marginTop: 14 },
  input:       { backgroundColor: C.surfaceLow, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, fontWeight: "600", color: C.onSurface },
  emailRow:    { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surfaceLow, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, opacity: 0.6 },
  emailText:   { fontSize: 14, fontWeight: "600", color: C.onSurface },
  emailHint:   { fontSize: 10, color: C.outline, marginTop: 4 },

  tipRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 16, marginBottom: 20, backgroundColor: "#F0FDF4", padding: 14, borderRadius: 14 },
  tipText: { flex: 1, fontSize: 12, color: "#166534", fontWeight: "600", lineHeight: 18 },

  actionsRow:  { flexDirection: "row", gap: 12, paddingHorizontal: 16 },
  discardBtn:  { flex: 1, height: 52, borderRadius: 16, borderWidth: 1, borderColor: C.outlineVar, justifyContent: "center", alignItems: "center" },
  discardText: { fontSize: 13, fontWeight: "900", color: C.onSurfaceVar },
  saveBtn:     { flex: 2, height: 52, borderRadius: 16, backgroundColor: C.primary, justifyContent: "center", alignItems: "center" },
  saveBtnText: { fontSize: 13, fontWeight: "900", color: "#fff" },
});
