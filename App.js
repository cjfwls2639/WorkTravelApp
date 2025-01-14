import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "./color";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const STORAGE_KEY = "@toDos";
const TNW_KEY = "TNW";
const API_URL = "http://192.168.0.5:3000";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [edit, setEdit] = useState({});
  const completed = false;
  useEffect(() => {
    loadToDos();
    loadTnW();
  }, []);
  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(TNW_KEY, "false");
  };
  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(TNW_KEY, "true");
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      const loadedToDos = response.data.reduce((acc, toDo) => {
        acc[toDo.id] = toDo;
        return acc;
      }, {});
      setToDos(loadedToDos);
    } catch (error) {
      console.error("Failed to load to-dos:", error);
    }
  };

  const loadTnW = async () => {
    const tnw = await AsyncStorage.getItem(TNW_KEY);
    tnw === "true" ? setWorking(true) : setWorking(false);
  };
  const addToDo = async () => {
    if (text === "") return;
    const newToDo = { text, working, completed };
    try {
      const response = await axios.post(`${API_URL}/todos`, newToDo);
      const savedToDo = response.data;
      setToDos((prevToDos) => ({ ...prevToDos, [savedToDo.id]: savedToDo }));
      setText("");
    } catch (error) {
      console.error("Failed to add to-do:", error);
    }
  };
  const editTextTrue = (key) => {
    setEdit((prev) => ({ ...prev, [key]: true }));
  };
  const editTextFalse = (key) => {
    setEdit((prev) => ({ ...prev, [key]: false }));
  };
  const editTextToDo = async (key) => {
    if (editText === "") return;
    const editedToDo = { ...toDos[key], text: editText };
    try {
      await axios.put(`${API_URL}/todos/${key}`, editedToDo);
      setToDos((prevToDos) => ({
        ...prevToDos,
        [key]: editedToDo,
      }));
      setEditText("");
      editTextFalse(key);
    } catch (error) {
      console.error("Failed to edit to-do:", error);
    }
  };
  const completedToDo = async (key) => {
    const updatedToDo = { ...toDos[key], completed: !toDos[key].completed };
    try {
      await axios.put(`${API_URL}/todos/${key}`, updatedToDo);
      setToDos((prevToDos) => ({
        ...prevToDos,
        [key]: updatedToDo,
      }));
    } catch (error) {
      console.error("Failed to update to-do:", error);
    }
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Sure",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/todos/${key}`);
            setToDos((prevToDos) => {
              const newToDos = { ...prevToDos };
              delete newToDos[key];
              return newToDos;
            });
          } catch (error) {
            console.error("Failed to delete to-do:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you edit to do?" : "Where do you edit to go?"
        }
        style={styles.input}
        hidden
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {edit[key] === true ? (
                <TextInput
                  onSubmitEditing={() => editTextToDo(key)}
                  onChangeText={onChangeEditText}
                  returnKeyType="done"
                  value={editText}
                  placeholder={
                    working
                      ? "What do you have to do?"
                      : "Where do you wnat to go?"
                  }
                  style={styles.input}
                  hidden
                />
              ) : (
                <Text
                  style={
                    toDos[key].completed === true
                      ? styles.toCompletedText
                      : styles.toDoText
                  }
                >
                  {toDos[key].text}
                </Text>
              )}

              <View style={styles.btnPos}>
                <TouchableOpacity
                  onPress={() => completedToDo(key)}
                  style={styles.eachBtn}
                >
                  {toDos[key].completed === true ? (
                    <Fontisto name="checkbox-active" size={24} color="black" />
                  ) : (
                    <Fontisto
                      name="checkbox-passive"
                      size={24}
                      color={theme.grey}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => editTextTrue(key)}
                  style={styles.eachBtn}
                >
                  <MaterialIcons name="edit" size={24} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={24} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toCompletedText: {
    color: "grey",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  btnPos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  eachBtn: {
    paddingRight: 10,
  },
});
