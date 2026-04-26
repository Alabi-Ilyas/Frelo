import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "../api/apiCalls";

export default function SignUp({ navigation }) {
  const [role, setRole] = useState("freelancer"); // Role state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleSignUp = async () => {
    if (!checked) return Alert.alert("Terms", "Please agree to the terms.");
    if (!fullName || !email || !password || !businessName) {
      return Alert.alert("Required", "Please fill all fields.");
    }

    setLoading(true);
    try {
      const userData = {
        name: fullName,
        email: email,
        password: password,
        businessName: businessName,
        role: role, // Dynamic role
      };

      const result = await registerUser(userData);
      if (result.success) {
        Alert.alert("Success", "Account created!");
        navigation.navigate("SignIn");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.tagline}>JOIN THE ECOSYSTEM</Text>
          <Text style={styles.heading}>Create Account</Text>
        </View>

        {/* ROLE SELECTOR */}
        <Text style={styles.inputLabel}>I want to join as a:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              role === "freelancer" && styles.roleCardActive,
            ]}
            onPress={() => setRole("freelancer")}
          >
            <Ionicons
              name="hammer-outline"
              size={20}
              color={role === "freelancer" ? "#FFF" : "#1A1C19"}
            />
            <Text
              style={[
                styles.roleCardText,
                role === "freelancer" && { color: "#FFF" },
              ]}
            >
              FREELANCER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              role === "client" && styles.roleCardActive,
            ]}
            onPress={() => setRole("client")}
          >
            <Ionicons
              name="briefcase-outline"
              size={20}
              color={role === "client" ? "#FFF" : "#1A1C19"}
            />
            <Text
              style={[
                styles.roleCardText,
                role === "client" && { color: "#FFF" },
              ]}
            >
              CLIENT
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            placeholder="Ilyas Akande"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            placeholder="e.g. Ilyas Dev Solutions"
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            placeholder="email@example.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="••••••••"
              style={styles.flexInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setChecked(!checked)}
            style={styles.checkboxContainer}
          >
            <View style={[styles.checkbox, checked && styles.checkboxActive]}>
              {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the Terms & Conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignUp}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>GET STARTED</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignIn")}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            ALREADY HAVE AN ACCOUNT?{" "}
            <Text style={styles.signInLink}>LOG IN</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#FBFDF8", flexGrow: 1 },
  header: { marginTop: 40, marginBottom: 30 },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#6B7280",
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1C19",
    letterSpacing: -1,
  },

  roleContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F0F1EB",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  roleCardActive: { backgroundColor: "#1A1C19", borderColor: "#1A1C19" },
  roleCardText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#1A1C19",
  },

  form: { width: "100%" },
  inputLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1A1C19",
    marginBottom: 8,
    letterSpacing: 1,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    height: 55,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#F0F1EB",
    fontSize: 15,
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    height: 55,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  flexInput: { flex: 1, fontSize: 15 },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: "#1A1C19",
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#1A1C19" },
  checkboxText: { fontSize: 13, color: "#6B7280" },

  button: {
    backgroundColor: "#1A1C19",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footer: { marginTop: 30, alignItems: "center" },
  footerText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    letterSpacing: 1,
  },
  signInLink: { color: "#1A1C19" },
});
