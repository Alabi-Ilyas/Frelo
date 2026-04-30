import { C } from "../utils/theme";
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert, Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { UserPlus, Mail, Phone, Edit2, Trash2, Search } from "lucide-react-native";
import { getClients, createClient, updateClient, deleteClient } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import AddClientModal from "./modals/AddClientModal";
import EditClientModal from "./modals/EditClientModal";

export default function ClientScreen({ navigation }) {
  const [clients, setClients]       = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [addVisible, setAddVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async (q = search) => {
    try {
      const res = await getClients(q ? { search: q } : undefined);
      const data = res?.clients ?? [];
      setClients(data);
      setFiltered(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleSearch = (text) => {
    setSearch(text);
    const f = clients.filter(c => c.name.toLowerCase().includes(text.toLowerCase()));
    setFiltered(f);
  };

  const handleCreate = async (data) => {
    try { await createClient(data); setAddVisible(false); load(""); }
    catch (e) { Alert.alert("Error", "Could not create client."); }
  };

  const handleEdit = async (id, data) => {
    try { await updateClient(id, data); setEditTarget(null); load(""); }
    catch (e) { Alert.alert("Error", "Could not update client."); }
  };

  const confirmDelete = (client) => {
    Alert.alert(
      "Delete Client",
      `Permanently delete ${client.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try { await deleteClient(client._id); load(""); }
            catch (e) { Alert.alert("Error", "Could not delete client."); }
          },
        },
      ]
    );
  };

  const total   = clients.length;
  const active  = clients.filter(c => c.hasPortalAccess).length;
  const pending = clients.filter(c => c.portalInviteSent && !c.hasPortalAccess).length;

  const renderItem = ({ item }) => {
    const initials = item.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const portalLabel = item.hasPortalAccess ? "Portal Active"
      : item.portalInviteSent ? "Invite Sent" : "No Portal";
    const portalColor = item.hasPortalAccess ? "#16A34A" : "#9CA3AF";

    return (
      <View style={s.card}>
        <TouchableOpacity
          style={s.cardMain}
          onPress={() => navigation.navigate("ClientDetail", { clientId: item._id })}
          activeOpacity={0.7}
        >
          <View style={[s.avatar, { backgroundColor: item.color ?? "#7C6EF8" }]}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.nameRow}>
              <Text style={s.clientName}>{item.name}</Text>
              <View style={[s.portalBadge, { borderColor: portalColor }]}>
                <Text style={[s.portalText, { color: portalColor }]}>{portalLabel}</Text>
              </View>
            </View>
            <Text style={s.clientEmail} numberOfLines={1}>{item.email}</Text>
            {item.phone ? (
              <Text style={s.clientPhone}>{item.phone}</Text>
            ) : null}
            {item.tags?.length > 0 && (
              <View style={s.tagsRow}>
                {item.tags.slice(0, 3).map(tag => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={s.actions}>
          <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`mailto:${item.email}`)}>
            <Mail size={16} color="#6B7280" />
          </TouchableOpacity>
          {item.phone && (
            <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
              <Phone size={16} color="#16A34A" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.actionBtn} onPress={() => setEditTarget(item)}>
            <Edit2 size={16} color="#000613" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={() => confirmDelete(item)}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScreenHeader title="Clients." tagline="CLIENT DIRECTORY" onPressAdd={() => setAddVisible(true)} />

      {/* Stats */}
      {!loading && (
        <View style={s.statsRow}>
          {[
            { label: "Total Clients",  value: total },
            { label: "Active",         value: active },
            { label: "Pending Invite", value: pending },
          ].map(({ label, value }) => (
            <View key={label} style={s.statBox}>
              <Text style={s.statValue}>{value}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={s.searchRow}>
        <Search size={16} color="#9CA3AF" />
        <TextInput
          style={s.searchInput}
          placeholder="Search clients..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#000613" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <UserPlus size={48} color="#e6e8ea" />
              <Text style={s.emptyText}>No clients found.</Text>
            </View>
          }
        />
      )}

      <AddClientModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSave={handleCreate}
      />
      <EditClientModal
        visible={!!editTarget}
        client={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list:   { paddingHorizontal: 16, paddingBottom: 100 },

  statsRow: {
    flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "rgba(196,198,207,0.4)",
  },
  statBox:  { flex: 1, alignItems: "center" },
  statValue:{ fontSize: 20, fontWeight: "900", color: "#000613" },
  statLabel:{ fontSize: 9, fontWeight: "700", color: "#9CA3AF", marginTop: 2 },

  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,198,207,0.4)", marginHorizontal: 16, marginVertical: 12,
    paddingHorizontal: 14, height: 44, borderRadius: 14,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "600", color: "#000613" },

  card: {
    backgroundColor: "#FFF", borderRadius: 20, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)",
  },
  cardMain: { flexDirection: "row", gap: 12, marginBottom: 10 },
  avatar:   { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontWeight: "900", color: "#FFF" },

  nameRow:    { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 },
  clientName: { fontSize: 15, fontWeight: "800", color: "#000613" },
  portalBadge:{ borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  portalText: { fontSize: 9, fontWeight: "900" },
  clientEmail:{ fontSize: 12, color: "#6B7280", marginBottom: 2 },
  clientPhone:{ fontSize: 12, color: "#6B7280" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  tag:     { backgroundColor: "#f3f4f5", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: "900", color: "#6B7280" },

  actions:   { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  actionBtn: { width: 36, height: 36, backgroundColor: "#f8f9fa", borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  deleteBtn: { borderColor: "#FEE2E2" },

  empty:     { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },
});
