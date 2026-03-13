import { StatusBar } from "expo-status-bar";
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
import { useFonts } from "expo-font";
import { loginUser } from "../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../api/axios";
import { Ionicons } from "@expo/vector-icons"; // Added for better visuals

export default function SignIn({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!fontsLoaded) return null;

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert("Missing Info", "Email and password are required.");
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      await AsyncStorage.setItem("token", res.token);
      setAuthToken(res.token);
      navigation.replace("Dashboard");
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Invalid credentials",
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

        {/* --- LOGO SECTION (Fixed sizing) --- */}
        <View style={styles.headerSection}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.heading}>Welcome Back!</Text>
          <Text style={styles.subHeading}>
            Sign in to continue your progress
          </Text>
        </View>

        {/* --- INPUTS --- */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Email Address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* --- SIGN IN BUTTON --- */}
          <TouchableOpacity
            onPress={handleSignIn}
            style={[styles.button, loading && { opacity: 0.7 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* --- FOOTER / SIGN UP NAVIGATION --- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingBottom: 40,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 200, // Fixed width
    height: 200, // Fixed height
  },
  textSection: {
    marginBottom: 30,
    alignItems: "flex-start",
  },
  heading: {
    fontSize: 32,
    fontFamily: "Outfit-SemiBold",
    color: "#0A2166",
  },
  subHeading: {
    fontSize: 16,
    color: "#777",
    fontFamily: "Outfit-Regular",
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA", // Soft background instead of white
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EAECEF",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Outfit-Regular",
    fontSize: 16,
    color: "#000",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotText: {
    color: "#FF6600", // Using your orange accent for calls to action
    fontFamily: "Outfit-SemiBold",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#0A2166",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#0A2166",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },
  footerText: {
    fontSize: 15,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  signUpLink: {
    fontSize: 15,
    color: "#0A2166",
    fontFamily: "Outfit-SemiBold",
  },
});
