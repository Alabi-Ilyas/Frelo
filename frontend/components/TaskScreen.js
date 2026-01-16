import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TaskScreen() {
  const [selectedTab, setSelectedTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", date: new Date() });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Submit Project Proposal",
      time: "Today 10:00 AM",
      status: "Ongoing",
      color: "#FF6600",
      completed: false,
    },
    {
      id: 2,
      title: "Design Homepage",
      time: "Tomorrow 4:00 PM",
      status: "Upcoming",
      color: "#0A66FF",
      completed: false,
    },
    {
      id: 3,
      title: "Send Invoice",
      time: "Wed 9 May",
      status: "Upcoming",
      color: "#0A66FF",
      completed: false,
    },
  ]);

  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });
  if (!fontsLoaded) return null;

  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              status: !task.completed ? "Completed" : "Ongoing",
              color: !task.completed ? "#2ECC71" : "#FF6600",
            }
          : task
      )
    );
  };

  const handleAddTask = () => {
    if (newTask.title.trim() === "") return;

    const formattedDate = newTask.date.toLocaleString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    const newEntry = {
      id: tasks.length + 1,
      title: newTask.title,
      time: formattedDate,
      status: "Upcoming",
      color: "#0A66FF",
      completed: false,
    };
    setTasks((prev) => [...prev, newEntry]);
    setNewTask({ title: "", date: new Date() });
    if (Keyboard && typeof Keyboard.dismiss === "function") {
      Keyboard.dismiss();
    }
    setShowModal(false);
  };

  const filteredTasks =
    selectedTab === "All"
      ? tasks
      : tasks.filter((t) =>
          selectedTab === "Completed"
            ? t.status === "Completed"
            : t.status === selectedTab
        );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Tasks</Text>
        <Image
          source={require("../assets/images/Profile.png")}
          style={styles.profileImage}
          resizeMode="contain"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["All", "Ongoing", "Upcoming", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <TouchableOpacity
              style={styles.taskLeft}
              onPress={() => handleToggleComplete(task.id)}
            >
              <Ionicons
                name={task.completed ? "checkbox-outline" : "square-outline"}
                size={24}
                color={task.completed ? "#2ECC71" : "#C4C4C4"}
                style={{ marginRight: 10 }}
              />
              <View>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && {
                      textDecorationLine: "line-through",
                      color: "#777",
                    },
                  ]}
                >
                  {task.title}
                </Text>
                <Text style={styles.taskTime}>{task.time}</Text>
              </View>
            </TouchableOpacity>
            <View style={[styles.statusBadge, { backgroundColor: task.color }]}>
              <Text style={styles.statusText}>{task.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={newTask.title}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, title: text }))
              }
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerBtn}
            >
              <Ionicons name="calendar-outline" size={20} color="#0A2166" />
              <Text style={styles.dateText}>
                {newTask.date.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#0A2166" }]}
                onPress={handleAddTask}
              >
                <Text style={styles.modalBtnText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 👇 Move this outside of Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={newTask.date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate)
              setNewTask((prev) => ({ ...prev, date: selectedDate }));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#FF6600",
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Outfit-SemiBold", fontSize: 28, color: "#0A2166" },
  profileImage: { width: 45, height: 45 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 10,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 10 },
  activeTab: { backgroundColor: "#0A2166" },
  tabText: { fontFamily: "Outfit-Regular", fontSize: 16, color: "#000" },
  activeTabText: { color: "#fff", fontFamily: "Outfit-SemiBold" },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskLeft: { flexDirection: "row", alignItems: "center" },
  taskTitle: { fontFamily: "Outfit-SemiBold", fontSize: 17, color: "#0A2166" },
  taskTime: { fontFamily: "Outfit-Regular", fontSize: 14, color: "#444" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: "#fff", fontFamily: "Outfit-SemiBold", fontSize: 13 },
  floatingBtn: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#0A2166",
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 20,
    color: "#0A2166",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontFamily: "Outfit-Regular",
    marginBottom: 10,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  dateText: {
    fontFamily: "Outfit-Regular",
    color: "#0A2166",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontFamily: "Outfit-SemiBold",
  },
});
