import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Globe, Lock, Trash2, ChevronRight, ChevronDown } from "lucide-react-native";
import { useAuth } from "../components/context/AuthContext";
import { getProfile, updatePreferences, updateEmail, changePassword, deleteAccount } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import { C, shadow } from "../utils/theme";

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD", "JPY"];
const TIMEZONES = [
  { value: "America/New_York",    label: "(GMT-05:00) Eastern Time" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time" },
  { value: "Europe/London",       label: "(GMT+00:00) London" },
  { value: "Europe/Paris",        label: "(GMT+01:00) Paris" },
  { value: "Asia/Dubai",          label: "(GMT+04:00) Dubai" },
  { value: "Africa/Lagos",        label: "(GMT+01:00) Lagos" },
  { value: "Asia/Tokyo",          label: "(GMT+09:00) Tokyo" },
];

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useAuth();
  const isClient = user?.role === "client";
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [newEmail, setNewEmail]           = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail]     = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTzPicker, setShowTzPicker]             = useState(false);

  useEffect(() => {
    getProfile().then(res => {
      if (res?.success && res.user) {
        setCurrency(res.user.currency ?? "USD");
        setTimezone(res.user.timezone ?? "America/New_York");
      }
    }).catch(() => {});
  }, []);

  const handleSavePrefs = async () => {
    try { setSavingPrefs(true); await updatePreferences({ currency, timezone }); Alert.alert("Saved", "Preferences updated."); }
    catch { Alert.alert("Error", "Could not save preferences."); }
    finally { setSavingPrefs(false); }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !emailPassword) return Alert.alert("Required", "All fields are required.");
    try { setSavingEmail(true); await updateEmail({ email: newEmail, password: emailPassword }); setNewEmail(""); setEmailPassword(""); Alert.alert("Updated", "Email updated."); }
    catch (e) { Alert.alert("Error", e.response?.data?.message ?? "Could not update email."); }
    finally { setSavingEmail(false); }
  };

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) return Alert.alert("Mismatch", "Passwords do not match.");
    if (newPwd.length < 6)    return Alert.alert("Too Short", "Minimum 6 characters.");
    try { setSavingPwd(true); await changePassword({ currentPassword: currentPwd, newPassword: newPwd }); setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); Alert.alert("Updated", "Password updated."); }
    catch (e) { Alert.alert("Error", e.response?.data?.message ?? "Could not update password."); }
    finally { setSavingPwd(false); }
  };

  const handleDeleteAccount = async () => {
    try { setDeleting(true); await deleteAccount(); logout(); }
    catch { Alert.alert("Error", "Could not deactivate account."); }
    finally { setDeleting(false); }
  };

  const tzLabel = TIMEZONES.find(t => t.value === timezone)?.label ?? timezone;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <ScreenHeader title="Settings." tagline="PROTOCOLS & PRIVACY" />

      {/* Regional Preferences */}
      <Text style={s.sectionHeader}>REGIONAL PREFERENCES</Text>
      <View style={[s.card, shadow]}>
        <Text style={s.fieldLabel}>CURRENCY</Text>
        <TouchableOpacity style={s.selector} onPress={() => { setShowCurrencyPicker(v => !v); setShowTzPicker(false); }}>
          <Globe size={16} color={C.outline} />
          <Text style={s.selectorText}>{currency}</Text>
          <ChevronDown size={16} color={C.outline} />
        </TouchableOpacity>
        {showCurrencyPicker && (
          <View style={s.dropdown}>
            {CURRENCIES.map(c => (
              <TouchableOpacity key={c} style={s.dropdownItem} onPress={() => { setCurrency(c); setShowCurrencyPicker(false); }}>
                <Text style={[s.dropdownText, currency === c && s.dropdownActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[s.fieldLabel, { marginTop: 16 }]}>TIMEZONE</Text>
        <TouchableOpacity style={s.selector} onPress={() => { setShowTzPicker(v => !v); setShowCurrencyPicker(false); }}>
          <Globe size={16} color={C.outline} />
          <Text style={s.selectorText} numberOfLines={1}>{tzLabel}</Text>
          <ChevronDown size={16} color={C.outline} />
        </TouchableOpacity>
        {showTzPicker && (
          <View style={s.dropdown}>
            {TIMEZONES.map(t => (
              <TouchableOpacity key={t.value} style={s.dropdownItem} onPress={() => { setTimezone(t.value); setShowTzPicker(false); }}>
                <Text style={[s.dropdownText, timezone === t.value && s.dropdownActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={s.saveBtn} onPress={handleSavePrefs} disabled={savingPrefs}>
          {savingPrefs ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save Preferences</Text>}
        </TouchableOpacity>
      </View>

      {/* Security */}
      <Text style={s.sectionHeader}>SECURITY</Text>
      <View style={[s.card, shadow]}>
        <Text style={s.subHeader}>Change Email</Text>
        <Text style={s.fieldLabel}>NEW EMAIL</Text>
        <TextInput style={s.input} value={newEmail} onChangeText={setNewEmail} placeholder="new@email.com" placeholderTextColor={C.outline} keyboardType="email-address" autoCapitalize="none" />
        <Text style={s.fieldLabel}>CONFIRM PASSWORD</Text>
        <TextInput style={s.input} value={emailPassword} onChangeText={setEmailPassword} placeholder="••••••••" placeholderTextColor={C.outline} secureTextEntry />
        <TouchableOpacity style={s.saveBtn} onPress={handleChangeEmail} disabled={savingEmail}>
          {savingEmail ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Update Email</Text>}
        </TouchableOpacity>

        <View style={s.divider} />

        <Text style={s.subHeader}>Change Password</Text>
        <Text style={s.fieldLabel}>CURRENT PASSWORD</Text>
        <TextInput style={s.input} value={currentPwd} onChangeText={setCurrentPwd} placeholder="••••••••" placeholderTextColor={C.outline} secureTextEntry />
        <Text style={s.fieldLabel}>NEW PASSWORD</Text>
        <TextInput style={s.input} value={newPwd} onChangeText={setNewPwd} placeholder="••••••••" placeholderTextColor={C.outline} secureTextEntry />
        <Text style={s.fieldLabel}>CONFIRM NEW PASSWORD</Text>
        <TextInput style={s.input} value={confirmPwd} onChangeText={setConfirmPwd} placeholder="••••••••" placeholderTextColor={C.outline} secureTextEntry />
        <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword} disabled={savingPwd}>
          {savingPwd ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Update Password</Text>}
        </TouchableOpacity>
      </View>

      {/* Workflow */}
      {!isClient && (
        <>
          <Text style={s.sectionHeader}>WORKFLOW</Text>
          <View style={[s.card, shadow]}>
            <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate("Availability")}>
              <Text style={s.linkText}>Work Hours</Text>
              <ChevronRight size={18} color={C.outlineVar} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.linkRow, s.linkBorder]} onPress={() => navigation.navigate("Profile")}>
              <Text style={s.linkText}>Profile Details</Text>
              <ChevronRight size={18} color={C.outlineVar} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {isClient && (
        <>
          <Text style={s.sectionHeader}>ACCOUNT</Text>
          <View style={[s.card, shadow]}>
            <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate("Profile")}>
              <Text style={s.linkText}>Profile Details</Text>
              <ChevronRight size={18} color={C.outlineVar} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Danger zone */}
      <Text style={[s.sectionHeader, { color: C.error }]}>DANGER ZONE</Text>
      <View style={[s.card, { borderColor: "#FECACA" }, shadow]}>
        <Text style={s.dangerTitle}>Deactivate Account</Text>
        <Text style={s.dangerDesc}>This will deactivate your account immediately.</Text>
        {!showDeleteConfirm ? (
          <TouchableOpacity style={s.deactivateBtn} onPress={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} color={C.error} />
            <Text style={s.deactivateText}>Deactivate</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.confirmRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowDeleteConfirm(false)}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={handleDeleteAccount} disabled={deleting}>
              {deleting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.confirmBtnText}>Confirm</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.background },
  container: { paddingBottom: 100 },

  sectionHeader: { fontSize: 10, fontWeight: "900", color: C.onSurfaceVar, marginLeft: 16, marginBottom: 8, marginTop: 20, letterSpacing: 1.5 },
  card:          { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.outlineVar },
  subHeader:     { fontSize: 13, fontWeight: "900", color: C.primary, marginBottom: 4 },
  fieldLabel:    { fontSize: 9, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1.5, marginBottom: 6, marginTop: 12 },
  input:         { backgroundColor: C.surfaceLow, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: "600", color: C.onSurface },
  selector:      { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surfaceLow, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  selectorText:  { flex: 1, fontSize: 14, fontWeight: "600", color: C.onSurface },
  dropdown:      { backgroundColor: C.card, borderRadius: 12, marginTop: 6, borderWidth: 1, borderColor: C.outlineVar, overflow: "hidden" },
  dropdownItem:  { padding: 12, borderBottomWidth: 1, borderBottomColor: C.surfaceLow },
  dropdownText:  { fontSize: 13, fontWeight: "600", color: C.onSurface },
  dropdownActive:{ color: C.secondary, fontWeight: "900" },
  saveBtn:       { backgroundColor: C.primary, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 16 },
  saveBtnText:   { color: "#fff", fontWeight: "900", fontSize: 13 },
  divider:       { height: 1, backgroundColor: C.surfaceLow, marginVertical: 20 },

  linkRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  linkBorder: { borderTopWidth: 1, borderTopColor: C.surfaceLow },
  linkText:   { fontSize: 15, fontWeight: "700", color: C.onSurface },

  dangerTitle:    { fontSize: 15, fontWeight: "800", color: C.onSurface, marginBottom: 4 },
  dangerDesc:     { fontSize: 13, color: C.onSurfaceVar, marginBottom: 14 },
  deactivateBtn:  { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#FECACA", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: "flex-start" },
  deactivateText: { fontSize: 12, fontWeight: "900", color: C.error },
  confirmRow:     { flexDirection: "row", gap: 10 },
  cancelBtn:      { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.outlineVar, justifyContent: "center", alignItems: "center" },
  cancelBtnText:  { fontSize: 12, fontWeight: "900", color: C.onSurfaceVar },
  confirmBtn:     { flex: 1, height: 44, borderRadius: 12, backgroundColor: C.error, justifyContent: "center", alignItems: "center" },
  confirmBtnText: { fontSize: 12, fontWeight: "900", color: "#fff" },

  logoutBtn:  { marginHorizontal: 16, marginTop: 24, marginBottom: 40, alignItems: "center" },
  logoutText: { fontSize: 15, fontWeight: "800", color: C.error },
});
