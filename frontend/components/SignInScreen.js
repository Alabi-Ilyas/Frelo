import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../components/context/AuthContext"; // Import your central auth logic
import { loginUser } from "../api/apiCalls";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";

export default function SignIn({ navigation }) {
  const { login } = useAuth(); // Use the login function from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    // Trim email to avoid hidden space validation errors on backend
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      return Alert.alert("Required", "Email and password are required.");
    }

    setLoading(true);
    try {
      // 1. Match your backend's POST /api/auth/login { email, password }
      const res = await loginUser({ email: cleanEmail, password });

      // 2. Your backend sends "success: true" on status 200
      if (res && res.success) {
        // 3. IMPORTANT: Match backend keys: res.accessToken and res.refreshToken
        // Do NOT use snake_case here.
        await login(res.user, res.accessToken, res.refreshToken);

        // Success! App.js will now auto-switch to MainApp.
      }
    } catch (err) {
      // Extracting the error from your R.unauthorized or R.serverError utilities
      const errorMsg =
        err.response?.data?.message || "Check your network connection";

      Alert.alert("Login Failed", errorMsg);
      console.log("Full Backend Error:", err.response?.data);
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
          <Text style={styles.tagline}>CONTINUE YOUR JOURNEY</Text>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subheading}>
            Enter your credentials to access your portal
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#6B7280" style={styles.icon} />
            <TextInput
              placeholder="email@example.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#6B7280" style={styles.icon} />
            <TextInput
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={18} color="#6B7280" />
              ) : (
                <Eye size={18} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignUp")}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            NEW TO FRELOPRO?{" "}
            <Text style={styles.signUpLink}>CREATE ACCOUNT</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FBFDF8",
    padding: 24,
    justifyContent: "center",
  },
  header: { marginBottom: 40 },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#6B7280",
    marginBottom: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1C19",
    letterSpacing: -1,
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
  },
  form: { width: "100%" },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#1A1C19",
    marginBottom: 8,
    letterSpacing: 1,
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1C19",
    fontWeight: "500",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 30,
  },
  forgotText: {
    color: "#1A1C19",
    fontWeight: "700",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#1A1C19",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    letterSpacing: 1,
  },
  signUpLink: { color: "#1A1C19" },
});
