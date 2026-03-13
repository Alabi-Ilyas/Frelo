import { StatusBar } from "expo-status-bar";
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
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "../api/axios";

export default function SignUp({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  const [checked, setChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!fontsLoaded) return null;

  const handleSignUp = async () => {
    if (!checked)
      return Alert.alert("Terms Required", "Please agree to the terms.");
    if (!fullName || !email || !password)
      return Alert.alert("Missing Info", "All fields are required.");

    setLoading(true);
    try {
      await registerUser({ fullName, email, password });
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("SignIn");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong!",
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
          <Image
            source={require("./../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Join the Frelo community today</Text>
        </View>

        <View style={styles.form}>
          
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Ilyas Name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

        
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="email@example.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

       
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="••••••••"
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
            onPress={() => setChecked(!checked)}
            style={styles.checkboxContainer}
          >
            <View style={[styles.checkbox, checked && styles.checkboxActive]}>
              {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the{" "}
              <Text style={styles.linkText}>Terms & Conditions</Text>
            </Text>
          </TouchableOpacity>

          
          <TouchableOpacity
            onPress={handleSignUp}
            style={[styles.button, loading && { opacity: 0.7 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.signInLink}>Sign In</Text>
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
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  heading: {
    fontSize: 28,
    fontFamily: "Outfit-SemiBold",
    color: "#0A2166",
    marginTop: -10,
  },
  subheading: {
    fontSize: 15,
    fontFamily: "Outfit-Regular",
    color: "#777",
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  inputLabel: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 14,
    color: "#0A2166",
    marginBottom: 8,
    marginTop: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#EAECEF",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Outfit-Regular",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderWidth: 2,
    borderColor: "#FF6600",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: "#FF6600",
  },
  checkboxText: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#666",
  },
  linkText: {
    color: "#FF6600",
    fontFamily: "Outfit-SemiBold",
  },
  button: {
    backgroundColor: "#0A2166",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
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
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    color: "#666",
  },
  signInLink: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 15,
    color: "#0A2166",
  },
});
