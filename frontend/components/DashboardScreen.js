import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
export default function Dashboard({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  const [checked, setChecked] = useState(false);
  if (!fontsLoaded) {
    return null; // Or a loading screen
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.view1}>
        <View style={styles.logo}>
          <Image
            source={require("./../assets/images/logo2.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logo2}>
          <Image
            source={require("./../assets/images/Profile.png")}
            style={styles.image2}
            resizeMode="contain"
          />
          <Ionicons
            style={styles.icon}
            name="settings-outline"
            size={32}
            color="black"
          />
        </View>
      </View>
      <Text style={styles.text1}>👋 Welcome back,Ilyas</Text>
      <Text style={styles.text2}>Here’s what’s on your plate today</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={styles.card1}>
          <Text style={styles.text3}>2</Text>
          <Text style={styles.text4}>Ongoing</Text>
        </View>
        <View style={styles.card2}>
          <Text style={styles.text3}>14</Text>
          <Text style={styles.text4}>Upcoming</Text>
        </View>
        <View style={styles.card3}>
          <Text style={styles.text3}>6</Text>
          <Text style={styles.text4}>Completed</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.text5}>My Tasks</Text>
        <Text style={styles.text5}>All Tasks</Text>
      </View>
      <View style={styles.card4}></View>
      <View style={styles.card4}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    alignItems: "left",
    alignSelf: "flex-start",
  },
  logo2: {
    alignSelf: "flex-start",
    marginLeft: 120,
    marginTop: -18,
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    width: 120,
    height: 120,
  },
  image2: {
    width: 120,
    height: 120,
  },
  view1: {
    flexDirection: "row",

    alignItems: "center",
  },
  icon: {
    marginTop: 10,
    marginLeft: -20,
  },
  text1: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 30,
    color: "#0A2166",
  },
  text2: {
    fontFamily: "Outfit-Regular",
    fontSize: 20,
    color: "#000000",
    marginTop: 5,
  },
  card1: {
    backgroundColor: "#FF6600",
    height: 78,
    width: 104,
    borderRadius: 20,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  card2: {
    backgroundColor: "#0A2166",
    height: 78,
    width: 104,
    borderRadius: 20,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  card3: {
    backgroundColor: "#18C18F",
    height: 78,
    width: 104,
    borderRadius: 20,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  text3: {
    fontFamily: "Outfit-Regular",
    fontSize: 24,
    color: "#FFFFFF",
  },
  text4: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  text5: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 22,
    color: "#0A2166",
    marginTop: 20,
  },
  card4: {
    height: 59,
    width: 363,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 0.7,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems,
  },});