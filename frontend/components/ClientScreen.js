import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Mail,
  Phone,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react-native";
import { getClients, createClient } from "../api/apiCalls"; // Added createClient
import ScreenHeader from "./ScreenHeader";
import CreateClientModal from "../components/modals/AddClientModal"; // We'll build this next

export default function ClientScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadClients = async () => {
    try {
      const res = await getClients();
      // Adjust based on your API structure (some return res.clients, others res.data)
      const clientData = res.clients || res.data || [];
      setClients(clientData);
      setFilteredClients(clientData);
    } catch (err) {
      console.error("Client load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Filter logic for search bar
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = clients.filter((c) =>
      c.name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredClients(filtered);
  };

  const handleCreateClient = async (clientData) => {
    try {
      await createClient(clientData);
      loadClients(); // Refresh list
    } catch (err) {
      alert("Error creating client. Check console.");
    }
  };

  const renderClientItem = ({ item }) => (
    <View style={styles.clientCard}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() =>
          navigation.navigate("ClientDetail", { clientId: item._id })
        }
      >
        <View
          style={[styles.avatar, { backgroundColor: item.color || "#D7E8CD" }]}
        >
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.clientEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionIcon}
          onPress={() => Linking.openURL(`mailto:${item.email}`)}
        >
          <Mail size={18} color="#6B7280" />
        </TouchableOpacity>

        {item.phone && (
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Phone size={18} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Clients"
        tagline="RELATIONSHIPS"
        onPressAdd={() => setModalVisible(true)}
      />

      {/* SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search clients..."
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item._id}
          renderItem={renderClientItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <User size={48} color="#E2E3DD" />
              <Text style={styles.emptyText}>No clients found.</Text>
            </View>
          }
        />
      )}

      <CreateClientModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateClient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchSection: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F1EB",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    gap: 10,
  },
  searchInput: { flex: 1, fontWeight: "600", fontSize: 14, color: "#1A1C19" },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  cardMain: { flex: 1, flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#1A1C19" },
  info: { marginLeft: 16, flex: 1 },
  clientName: { fontSize: 16, fontWeight: "800", color: "#1A1C19" },
  clientEmail: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, paddingRight: 4 },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, color: "#9CA3AF", fontWeight: "600" },
});
